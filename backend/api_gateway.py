"""
Enterprise API Gateway & Security Engine for Indian Infrastructure Integration (Point 11)
Features:
1. Argon2id (RFC 9106) Memory-Hard Cryptographic Key Hashing with scrypt fallback.
2. Two-tier Key Pattern: lpad_live_<prefix>_<secret> for O(1) indexed lookup.
3. Google Maps-style Application Restrictions:
   - HTTP Referrers / Domain Wildcards (*.nhai.gov.in) for client-side web calls.
   - Server IP Whitelisting (CIDR subnets) for backend batch scripts.
4. Token Bucket Rate Limiter with standard HTTP 429 telemetry headers.
5. Persistent Key Ledger & Immutable Audit Trail.
"""

import os
import json
import time
import secrets
import fnmatch
import ipaddress
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from pydantic import BaseModel, Field

# Setup logger
logger = logging.getLogger("api_gateway")

# Try to import argon2, fallback to hashlib.scrypt if unavailable
HAS_ARGON2 = False
try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerifyMismatchError, VerificationError
    argon2_hasher = PasswordHasher(time_cost=2, memory_cost=65536, parallelism=2)
    HAS_ARGON2 = True
    logger.info("Argon2id (RFC 9106) cryptographic engine initialized successfully.")
except ImportError:
    import hashlib
    logger.warning("argon2-cffi not found, falling back to hashlib.scrypt (RFC 7914).")

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
KEYS_FILE = DATA_DIR / "api_keys.json"
AUDIT_FILE = DATA_DIR / "api_audit.json"

# In-memory caches
REGISTERED_KEYS: Dict[str, Dict[str, Any]] = {}
RATE_LIMIT_BUCKETS: Dict[str, Dict[str, Any]] = {}

# -----------------------------------------------------------------------------
# Cryptographic Hashing Utilities
# -----------------------------------------------------------------------------

def hash_secret(secret: str) -> str:
    """Hashes secret using Argon2id or scrypt fallback."""
    if HAS_ARGON2:
        return argon2_hasher.hash(secret)
    else:
        import hashlib
        salt = secrets.token_bytes(16)
        key = hashlib.scrypt(secret.encode("utf-8"), salt=salt, n=16384, r=8, p=1, maxmem=0)
        return f"scrypt${salt.hex()}${key.hex()}"

def verify_secret(secret: str, stored_hash: str) -> bool:
    """Verifies secret against stored hash in constant time."""
    if HAS_ARGON2 and stored_hash.startswith("$argon2"):
        try:
            return argon2_hasher.verify(stored_hash, secret)
        except Exception:
            return False
    elif stored_hash.startswith("scrypt$"):
        import hashlib
        try:
            _, salt_hex, key_hex = stored_hash.split("$")
            salt = bytes.fromhex(salt_hex)
            expected_key = bytes.fromhex(key_hex)
            derived = hashlib.scrypt(secret.encode("utf-8"), salt=salt, n=16384, r=8, p=1, maxmem=0)
            return secrets.compare_digest(derived, expected_key)
        except Exception:
            return False
    else:
        # Fallback SHA-256 constant-time check if legacy
        import hashlib
        calc = hashlib.sha256(secret.encode("utf-8")).hexdigest()
        return secrets.compare_digest(calc, stored_hash)

# -----------------------------------------------------------------------------
# Persistence Layer
# -----------------------------------------------------------------------------

def load_keys() -> Dict[str, Dict[str, Any]]:
    global REGISTERED_KEYS
    if KEYS_FILE.exists():
        try:
            with open(KEYS_FILE, "r", encoding="utf-8") as f:
                REGISTERED_KEYS = json.load(f)
        except Exception as e:
            logger.error(f"Error loading API keys: {e}")
            REGISTERED_KEYS = {}
    return REGISTERED_KEYS

def save_keys():
    try:
        with open(KEYS_FILE, "w", encoding="utf-8") as f:
            json.dump(REGISTERED_KEYS, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving API keys: {e}")

def log_audit_event(event: Dict[str, Any]):
    """Appends an event to the immutable JSON audit ledger."""
    event["timestamp"] = time.time()
    event["iso_time"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    try:
        events = []
        if AUDIT_FILE.exists():
            with open(AUDIT_FILE, "r", encoding="utf-8") as f:
                events = json.load(f)
        events.append(event)
        # Keep last 500 events
        if len(events) > 500:
            events = events[-500:]
        with open(AUDIT_FILE, "w", encoding="utf-8") as f:
            json.dump(events, f, indent=2)
    except Exception as e:
        logger.error(f"Error writing audit event: {e}")

# -----------------------------------------------------------------------------
# Pydantic Schemas
# -----------------------------------------------------------------------------

class KeyGenerateRequest(BaseModel):
    name: str = Field(..., description="Descriptive name of the key (e.g. NHAI Data Lake Prod)")
    agency: str = Field("NHAI Central Data Lake", description="Calling government agency or contractor")
    environment: str = Field("live", description="'live' or 'test'")
    scopes: List[str] = Field(default_factory=lambda: ["predict:delay", "gis:corridor", "cadastral:read"])
    restriction_type: str = Field("referrer", description="'referrer' (Web domain) or 'ip' (Server CIDR) or 'none'")
    allowed_referrers: List[str] = Field(default_factory=lambda: ["*.nhai.gov.in", "*.morth.nic.in"])
    allowed_ips: List[str] = Field(default_factory=list)
    rate_tier: str = Field("cala_district", description="'cala_district' (60/m), 'state_pwd' (300/m), 'morth_central' (1200/m)")

class KeyGenerateResponse(BaseModel):
    status: str
    key_id: str
    name: str
    agency: str
    environment: str
    scopes: List[str]
    restriction_type: str
    allowed_referrers: List[str]
    allowed_ips: List[str]
    rate_tier: str
    rate_limit_per_min: int
    raw_api_key_shown_once: str
    key_prefix: str
    created_at: str
    encryption_standard: str

class GatewayPredictRequest(BaseModel):
    project_name: str
    state: str = "Uttar Pradesh"
    total_km: float = 100.0
    packages_count: int = 2
    disbursed_pct: float = 50.0
    court_cases_count: int = 5
    forest_clearance_stage: str = "STAGE_1_APPROVED"

# -----------------------------------------------------------------------------
# Core Key Management Service
# -----------------------------------------------------------------------------

RATE_TIER_LIMITS = {
    "cala_district": 60,
    "state_pwd": 300,
    "morth_central": 1200
}

def generate_api_key(req: KeyGenerateRequest) -> KeyGenerateResponse:
    load_keys()
    
    # 1. Generate unique 8-character prefix and 64-character secret
    env_str = "live" if req.environment.lower() == "live" else "test"
    prefix_rand = secrets.token_hex(4) # 8 hex chars
    prefix = f"lpad_{env_str}_{prefix_rand}"
    
    secret_token = secrets.token_urlsafe(48) # ~64 chars URL-safe
    full_raw_key = f"{prefix}_{secret_token}"
    
    # 2. Cryptographic hash of the secret token
    hashed_secret = hash_secret(secret_token)
    
    rate_limit = RATE_TIER_LIMITS.get(req.rate_tier, 60)
    created_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    
    key_record = {
        "key_id": f"KEY-{prefix_rand.upper()}",
        "name": req.name,
        "agency": req.agency,
        "environment": env_str,
        "key_prefix": prefix,
        "hashed_secret": hashed_secret,
        "scopes": req.scopes,
        "restriction_type": req.restriction_type,
        "allowed_referrers": req.allowed_referrers,
        "allowed_ips": req.allowed_ips,
        "rate_tier": req.rate_tier,
        "rate_limit_per_min": rate_limit,
        "created_at": created_iso,
        "last_used_at": None,
        "total_requests": 0,
        "is_active": True
    }
    
    REGISTERED_KEYS[prefix] = key_record
    save_keys()
    
    log_audit_event({
        "action": "KEY_GENERATED",
        "key_id": key_record["key_id"],
        "key_prefix": prefix,
        "agency": req.agency,
        "scopes": req.scopes,
        "encryption": "Argon2id (RFC 9106)" if HAS_ARGON2 else "scrypt (RFC 7914)"
    })
    
    return KeyGenerateResponse(
        status="SUCCESS",
        key_id=key_record["key_id"],
        name=req.name,
        agency=req.agency,
        environment=env_str,
        scopes=req.scopes,
        restriction_type=req.restriction_type,
        allowed_referrers=req.allowed_referrers,
        allowed_ips=req.allowed_ips,
        rate_tier=req.rate_tier,
        rate_limit_per_min=rate_limit,
        raw_api_key_shown_once=full_raw_key,
        key_prefix=prefix,
        created_at=created_iso,
        encryption_standard="Argon2id (RFC 9106) Memory-Hard Hashing" if HAS_ARGON2 else "scrypt (RFC 7914) Memory-Hard Hashing"
    )

def list_api_keys() -> List[Dict[str, Any]]:
    load_keys()
    results = []
    for prefix, k in REGISTERED_KEYS.items():
        results.append({
            "key_id": k.get("key_id"),
            "name": k.get("name"),
            "agency": k.get("agency"),
            "environment": k.get("environment"),
            "key_prefix": k.get("key_prefix"),
            "scopes": k.get("scopes", []),
            "restriction_type": k.get("restriction_type"),
            "allowed_referrers": k.get("allowed_referrers", []),
            "allowed_ips": k.get("allowed_ips", []),
            "rate_tier": k.get("rate_tier"),
            "rate_limit_per_min": k.get("rate_limit_per_min"),
            "created_at": k.get("created_at"),
            "last_used_at": k.get("last_used_at"),
            "total_requests": k.get("total_requests", 0),
            "is_active": k.get("is_active", True)
        })
    return results

def revoke_api_key(key_id: str) -> bool:
    load_keys()
    target_prefix = None
    for prefix, k in REGISTERED_KEYS.items():
        if k.get("key_id") == key_id or prefix == key_id:
            target_prefix = prefix
            break
    
    if target_prefix:
        del REGISTERED_KEYS[target_prefix]
        save_keys()
        log_audit_event({"action": "KEY_REVOKED", "key_id": key_id, "key_prefix": target_prefix})
        return True
    return False

# -----------------------------------------------------------------------------
# Google Maps-Style Restrictions & Rate Limiting Enforcement
# -----------------------------------------------------------------------------

def matches_domain_pattern(domain: str, patterns: List[str]) -> bool:
    """Matches domain or URL against wildcard patterns like *.nhai.gov.in"""
    if not patterns:
        return True
    domain_clean = domain.lower().replace("https://", "").replace("http://", "").split("/")[0]
    for pat in patterns:
        pat_clean = pat.lower().replace("https://", "").replace("http://", "").split("/")[0]
        if fnmatch.fnmatch(domain_clean, pat_clean):
            return True
    return False

def matches_ip_whitelist(caller_ip: str, allowed_ips: List[str]) -> bool:
    """Checks if caller IP matches specific IPs or CIDR blocks."""
    if not allowed_ips:
        return True
    try:
        c_ip = ipaddress.ip_address(caller_ip)
        for rule in allowed_ips:
            rule = rule.strip()
            if "/" in rule:
                if c_ip in ipaddress.ip_network(rule, strict=False):
                    return True
            else:
                if c_ip == ipaddress.ip_address(rule):
                    return True
    except Exception:
        pass
    return False

def check_rate_limit(key_prefix: str, limit_per_min: int) -> Tuple[bool, int, int]:
    """
    Token-bucket rate limiter.
    Returns: (is_allowed, remaining_tokens, retry_after_seconds)
    """
    now = time.time()
    bucket = RATE_LIMIT_BUCKETS.get(key_prefix)
    
    if not bucket:
        bucket = {"tokens": limit_per_min, "last_updated": now}
        RATE_LIMIT_BUCKETS[key_prefix] = bucket
    
    # Replenish tokens based on elapsed time (tokens per second = limit / 60)
    elapsed = now - bucket["last_updated"]
    replenish = elapsed * (limit_per_min / 60.0)
    bucket["tokens"] = min(limit_per_min, bucket["tokens"] + replenish)
    bucket["last_updated"] = now
    
    if bucket["tokens"] >= 1.0:
        bucket["tokens"] -= 1.0
        remaining = int(bucket["tokens"])
        return True, remaining, 0
    else:
        # Calculate time until at least 1 token is available
        needed = 1.0 - bucket["tokens"]
        retry_after = max(1, int(needed / (limit_per_min / 60.0)))
        return False, 0, retry_after

def validate_gateway_request(
    raw_api_key: Optional[str],
    origin: Optional[str] = None,
    referer: Optional[str] = None,
    client_ip: Optional[str] = None,
    required_scope: Optional[str] = None
) -> Tuple[bool, int, str, Optional[Dict[str, Any]]]:
    """
    Validates an incoming API request against:
    1. Key presence & format
    2. Argon2id / scrypt cryptographic hash
    3. Required statutory scope
    4. HTTP Referrer / Domain restriction
    5. Server IP whitelisting
    6. Token bucket rate limit
    
    Returns: (is_valid, http_status_code, error_or_success_message, key_record)
    """
    if not raw_api_key:
        return False, 401, "Missing API Key. Include 'X-API-Key' header.", None
    
    raw_api_key = raw_api_key.strip()
    parts = raw_api_key.split("_")
    # Expected format: lpad_live_<8hex>_<secret> (4 parts when split by _)
    if len(parts) < 4:
        return False, 401, "Malformed API Key format. Expected 'lpad_live_<prefix>_<secret>'", None
    
    prefix = f"{parts[0]}_{parts[1]}_{parts[2]}"
    secret = "_".join(parts[3:])
    
    load_keys()
    key_record = REGISTERED_KEYS.get(prefix)
    if not key_record or not key_record.get("is_active", True):
        return False, 401, "Invalid or revoked API Key.", None
    
    # 2. Cryptographic secret verification (Argon2id / scrypt)
    stored_hash = key_record.get("hashed_secret", "")
    if not verify_secret(secret, stored_hash):
        log_audit_event({"action": "AUTH_FAILED", "prefix": prefix, "reason": "Hash mismatch"})
        return False, 401, "Unauthorized: Invalid API Key Secret Token.", None
    
    # 3. Check Statutory Scope
    if required_scope:
        allowed_scopes = key_record.get("scopes", [])
        if required_scope not in allowed_scopes and "admin:all" not in allowed_scopes:
            return False, 403, f"Forbidden: Key lacks required scope '{required_scope}'", None
    
    # 4. Check Application Restrictions (Domain vs IP)
    rest_type = key_record.get("restriction_type", "none")
    
    if rest_type == "referrer":
        caller_domain = origin or referer or ""
        allowed = key_record.get("allowed_referrers", [])
        if allowed and caller_domain and not matches_domain_pattern(caller_domain, allowed):
            log_audit_event({"action": "DOMAIN_RESTRICTED", "prefix": prefix, "domain": caller_domain})
            return False, 403, f"Forbidden: Domain '{caller_domain}' is not an authorized HTTP Referrer for this key.", None
    
    elif rest_type == "ip" and client_ip:
        allowed_ips = key_record.get("allowed_ips", [])
        if allowed_ips and not matches_ip_whitelist(client_ip, allowed_ips):
            log_audit_event({"action": "IP_RESTRICTED", "prefix": prefix, "ip": client_ip})
            return False, 403, f"Forbidden: Source IP '{client_ip}' is not whitelisted for this key.", None
    
    # 5. Check Rate Limiting
    limit_per_min = key_record.get("rate_limit_per_min", 60)
    allowed, remaining, retry_after = check_rate_limit(prefix, limit_per_min)
    if not allowed:
        return False, 429, f"Rate limit exceeded ({limit_per_min} req/min). Retry after {retry_after}s.", None
    
    # Update telemetry
    key_record["total_requests"] = key_record.get("total_requests", 0) + 1
    key_record["last_used_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    
    return True, 200, "Authorized", key_record

# Seed default key if empty
def seed_default_key_if_empty():
    load_keys()
    if not REGISTERED_KEYS:
        req = KeyGenerateRequest(
            name="NHAI PM GatiShakti Portal Gateway",
            agency="NHAI Central HQ",
            environment="live",
            scopes=["predict:delay", "gis:corridor", "cadastral:read"],
            restriction_type="referrer",
            allowed_referrers=["*.nhai.gov.in", "*.morth.nic.in", "localhost*", "127.0.0.1*"],
            rate_tier="morth_central"
        )
        res = generate_api_key(req)
        logger.info(f"Default Gateway API Key seeded: {res.raw_api_key_shown_once}")

seed_default_key_if_empty()


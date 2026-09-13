"""
Celery Configuration for Distributed ML Task Execution
Uses Redis as message broker and results backend.
"""

import os
from celery import Celery

REDIS_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
REDIS_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")

celery = Celery(
    "gatishakti_tasks",
    broker=REDIS_BROKER_URL,
    backend=REDIS_RESULT_BACKEND,
    include=["tasks"]
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 min max
    worker_prefetch_multiplier=1,
    broker_connection_retry_on_startup=True
)


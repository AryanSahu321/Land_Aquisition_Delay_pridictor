import os
import sys

# Ensure backend directory is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from backend.main import app as fastapi_app

# On Hugging Face Spaces, Gradio is pre-installed
try:
    import gradio as gr
    with gr.Blocks(title="PM GatiShakti Land Acquisition Intelligence API") as demo:
        gr.Markdown("""
        # 🏛️ PM GatiShakti &bull; Land Acquisition Intelligence Platform
        ### Production AI & Decision Support Backend (NH Act 1956 & RFCTLARR Act 2013)
        
        - **API Status**: 🟢 Active & Serving Live Requests
        - **Documentation**: [Interactive Swagger UI (/docs)](/docs)
        - **Health Endpoint**: [/api/v1/health](/api/v1/health)
        - **Search Projects API**: `/api/v1/projects/search-options` & `/api/v1/projects/parse-and-predict`
        - **ML Ensemble**: Soft-Voting XGBoost + LightGBM + TreeSHAP Explainability
        """)
    app = gr.mount_gradio_app(fastapi_app, demo, path="/")
except ImportError:
    app = fastapi_app

if __name__ == "__main__":
    import uvicorn
    # Hugging Face Spaces uses port 7860
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)

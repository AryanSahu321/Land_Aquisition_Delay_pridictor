import os
import sys
import uvicorn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# ZeroGPU hook for Hugging Face Spaces
try:
    import spaces
    @spaces.GPU
    def zero_gpu_handler():
        return True
except Exception:
    pass

from backend.main import app as fastapi_app
import gradio as gr

with gr.Blocks(title="PM GatiShakti Land Acquisition Intelligence API") as demo:
    gr.Markdown("""
    # 🏛️ PM GatiShakti &bull; Land Acquisition Intelligence Platform
    ### Production AI & Decision Support Backend (NH Act 1956 & RFCTLARR Act 2013)
    
    - **API Status**: 🟢 Active & Serving Live Requests
    - **Interactive Documentation**: [Open Swagger UI (/docs)](/docs)
    - **Health Endpoint**: [/api/v1/health](/api/v1/health)
    - **Search Projects API**: `/api/v1/projects/search-options` & `/api/v1/projects/parse-and-predict`
    """)

# Mount Gradio at /gradio so FastAPI is the primary application handler for / and all /api/ routes
app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)

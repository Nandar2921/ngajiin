from sentence_transformers import SentenceTransformer
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from typing import List

# Load model IndoBERT
print("📥 Loading IndoBERT model...")
model = SentenceTransformer("indobenchmark/indobert-base-p2")
print("✅ Model siap!")

app = FastAPI()

class EmbedRequest(BaseModel):
    text: str

class BatchEmbedRequest(BaseModel):
    texts: List[str]

@app.post("/embed")
async def get_embedding(request: EmbedRequest):
    embedding = model.encode(request.text).tolist()
    return {"embedding": embedding}

@app.post("/embed/batch")
async def get_embeddings_batch(request: BatchEmbedRequest):
    """Proses banyak teks sekaligus (lebih cepat)"""
    embeddings = model.encode(request.texts).tolist()
    return {"embeddings": embeddings}

@app.get("/health")
async def health():
    return {"status": "ok", "model": "indobert-base-p2"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, timeout_keep_alive=120)
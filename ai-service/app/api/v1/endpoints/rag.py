from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import chromadb
from chromadb.utils import embedding_functions

router = APIRouter()

# 1. Kết nối ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

try:
    collection = chroma_client.get_collection(
        name="film_photography_kb", 
        embedding_function=embedding_fn
    )
except Exception:
    collection = None

# 2. Schemas
class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3

class RAGRequest(BaseModel):
    question: str

# 3. Endpoint Semantic Search
@router.post("/search", summary="Semantic Search trong Knowledge Base")
def semantic_search(req: SearchRequest):
    if not collection:
        raise HTTPException(status_code=500, detail="Chưa tìm thấy Vector Collection.")
    
    results = collection.query(
        query_texts=[req.query],
        n_results=req.top_k
    )
    
    formatted_results = []
    if results["ids"] and len(results["ids"][0]) > 0:
        for i in range(len(results["ids"][0])):
            formatted_results.append({
                "chunk_id": results["ids"][0][i],
                "content": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i]
            })
            
    return {
        "query": req.query,
        "total_results": len(formatted_results),
        "results": formatted_results
    }

# 4. Endpoint RAG Question Answering
@router.post("/rag/ask", summary="RAG Question Answering")
def rag_ask(req: RAGRequest):
    if not collection:
        raise HTTPException(status_code=500, detail="Chưa tìm thấy Vector Collection.")

    results = collection.query(
        query_texts=[req.question],
        n_results=3
    )
    
    docs = results["documents"][0] if results["documents"] else []
    metas = results["metadatas"][0] if results["metadatas"] else []
    distances = results["distances"][0] if results["distances"] else []

    DISTANCE_THRESHOLD = 1.3
    if not docs or (len(distances) > 0 and distances[0] > DISTANCE_THRESHOLD):
        return {
            "question": req.question,
            "answer": "Rất tiếc, hệ thống không tìm thấy thông tin phù hợp trong cơ sở dữ liệu kiến thức để trả lời câu hỏi này.",
            "sources": []
        }

    context_str = "\n\n---\n\n".join(docs)
    generated_answer = f"Dựa trên tài liệu kỹ thuật tìm thấy: {context_str}"

    return {
        "question": req.question,
        "answer": generated_answer,
        "sources": metas
    }
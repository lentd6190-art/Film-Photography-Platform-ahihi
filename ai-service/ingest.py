import os
import json
import chromadb
from chromadb.utils import embedding_functions
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Khởi tạo ChromaDB lưu dữ liệu tại thư mục local ./chroma_db
chroma_client = chromadb.PersistentClient(path="./chroma_db")
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

collection = chroma_client.get_or_create_collection(
    name="film_photography_kb", 
    embedding_function=embedding_fn
)

# 2. Cấu hình Chunking Strategy
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

# Đường dẫn chính xác tới file metadata.jsonl bên trong ai-service/knowledge_base/
METADATA_FILE = "./app/knowledge_base/metadata.jsonl"

def process_and_ingest():
    if not os.path.exists(METADATA_FILE):
        print(f"Không tìm thấy file metadata tại: {METADATA_FILE}")
        return

    documents, metadatas, ids = [], [], []
    doc_counter = 0

    with open(METADATA_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            meta_item = json.loads(line)
            file_path = os.path.join("./app", meta_item.get("file_path", ""))
            
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as doc_file:
                    content = doc_file.read()
                
                # Chia nhỏ văn bản thành các Chunk
                chunks = text_splitter.split_text(content)
                
                for i, chunk in enumerate(chunks):
                    doc_counter += 1
                    documents.append(chunk)
                    ids.append(f"{meta_item.get('doc_id', 'doc')}_chunk_{i}")
                    
                    # Lưu giữ Metadata chuẩn hóa từ Task 9
                    metadatas.append({
                        "doc_id": str(meta_item.get("doc_id", "")),
                        "title": str(meta_item.get("title", "")),
                        "topic": str(meta_item.get("topic", "")),
                        "publisher": str(meta_item.get("publisher", "")),
                        "file_path": str(meta_item.get("file_path", ""))
                    })

    if documents:
        collection.add(documents=documents, metadatas=metadatas, ids=ids)
        print(f"Thành công! Đã nạp {len(documents)} chunks vào Vector Database (ChromaDB).")
    else:
        print("Không tìm thấy dữ liệu tài liệu để nạp.")

if __name__ == "__main__":
    process_and_ingest()
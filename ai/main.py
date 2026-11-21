from fastapi import FastAPI

app = FastAPI(
    title="Film Photography AI Service",
    description="AI microservice for the Film Photography Platform",
    version="1.0.0",
)


@app.get("/health")
def health_check():
    return {
        "service": "AI Service",
        "status": "Healthy"
    }
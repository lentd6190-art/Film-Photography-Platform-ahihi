from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Film Photography AI Microservice"
    API_V1_STR: str = "/ai/v1"
    PORT: int = 8001
    
    OPENAI_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    RESOURCE_SERVICE_URL: str = "http://localhost:8080/api/v1"
    BOOKING_SERVICE_URL: str = "http://localhost:8082/api/v1"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
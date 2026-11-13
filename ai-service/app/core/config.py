from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Film Photography AI Microservice"
    API_V1_STR: str = "/ai/v1"
    PORT: int = 8001

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
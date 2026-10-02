import os
from pydantic import BaseModel

class Settings(BaseModel):
    service_name: str = "SkillSync Personalization Service"
    version: str = "2.0.0"
    port: int = int(os.getenv("PORT", "8001"))
    host: str = os.getenv("HOST", "0.0.0.0")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    learning_resources_file: str = os.getenv(
        "RESOURCES_PATH",
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "resources", "skillsync_learning_resources.json")
    )

settings = Settings()

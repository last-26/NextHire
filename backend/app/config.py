from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://nexthire:nexthire@db:5432/nexthire"

    # AWS Bedrock
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_DEFAULT_REGION: str = "eu-central-1"

    # LLM Configuration
    LLM_PROVIDER: str = "bedrock"
    LLM_FAST_MODEL: str = "eu.anthropic.claude-haiku-4-5-20251001-v1:0"
    LLM_POWER_MODEL: str = "eu.anthropic.claude-sonnet-4-20250514-v1:0"

    # App
    APP_ENV: str = "development"
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()

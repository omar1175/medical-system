import os
from django.conf import settings
from openai import OpenAI


_client = None


def get_client():
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY", "")
        base_url = os.environ.get("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
        _client = OpenAI(api_key=api_key, base_url=base_url)
    return _client


def get_model():
    return os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")


def is_available():
    return bool(os.environ.get("GROQ_API_KEY"))

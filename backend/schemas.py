from pydantic import BaseModel, HttpUrl, ConfigDict
from datetime import datetime


class URLCreate(BaseModel):
    url: HttpUrl      # ← validates it's a proper http(s) URL


class URLResponse(BaseModel):
    id: int
    short_code: str
    original_url: str
    clicks: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
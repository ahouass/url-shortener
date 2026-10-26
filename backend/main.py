from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import URL
from schemas import URLCreate, URLResponse

Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
        "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"


def base62_encode(num: int) -> str:
    """Convert a positive integer to a base62 string."""
    if num == 0:
        return BASE62[0]
    out = []
    while num:
        num, rem = divmod(num, 62)
        out.append(BASE62[rem])
    return "".join(reversed(out))


# ─── SPECIFIC ROUTES FIRST ───

@app.post("/shorten", response_model=URLResponse, status_code=201)
def shorten(payload: URLCreate, db: Session = Depends(get_db)):
    # Temporary unique placeholder; replaced before commit
    url = URL(original_url=str(payload.url), short_code="__pending__")
    db.add(url)
    db.flush()                       # gets id WITHOUT committing
    url.short_code = base62_encode(url.id)
    db.commit()
    db.refresh(url)
    return url


@app.get("/urls", response_model=list[URLResponse])
def list_urls(db: Session = Depends(get_db)):
    result = db.execute(select(URL).order_by(URL.id.desc()))
    return result.scalars().all()


@app.delete("/urls/{code}", status_code=204)
def delete_url(code: str, db: Session = Depends(get_db)):
    url = db.execute(select(URL).where(URL.short_code == code)).scalar_one_or_none()
    if url is None:
        raise HTTPException(status_code=404, detail="Short URL not found")
    db.delete(url)
    db.commit()
    return


# ─── CATCH-ALL ROUTE LAST (MUST be last!) ───

@app.get("/{code}")
def redirect(code: str, db: Session = Depends(get_db)):
    url = db.execute(select(URL).where(URL.short_code == code)).scalar_one_or_none()
    if url is None:
        raise HTTPException(status_code=404, detail="Short URL not found")
    url.clicks += 1
    db.commit()
    return RedirectResponse(url.original_url, status_code=307)
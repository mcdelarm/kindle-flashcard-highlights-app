# ---- Builder stage ----
FROM python:3.12-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

RUN python -m spacy download en_core_web_sm

RUN python -m nltk.downloader -d /usr/local/share/nltk_data wordnet omw-1.4

# ---- Final stage ----
FROM python:3.12-slim

WORKDIR /app

ENV NLTK_DATA=/usr/local/share/nltk_data

COPY --from=builder /usr/local /usr/local

COPY . .

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
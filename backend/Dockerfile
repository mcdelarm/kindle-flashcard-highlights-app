# ---- Builder stage ----
FROM python:3.12-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./

# Install normally (NOT --prefix)
RUN pip install --no-cache-dir -r requirements.txt

# Now spaCy is available → download works
RUN python -m spacy download en_core_web_sm

# ---- Final stage ----
FROM python:3.12-slim

WORKDIR /app

# Copy installed packages + model
COPY --from=builder /usr/local /usr/local

COPY . .

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
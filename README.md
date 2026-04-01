# Kindle Flashcard Highlights App

Convert your Kindle clippings into vocabulary flashcards and highlights for efficient language learning and reading review.

## Features
- Upload Kindle clippings or vocabulary database files
- Generate flashcards from vocabulary
- View and manage highlights from your books
- User authentication and session management
- Persistent storage with PostgreSQL and Redis
- Modern frontend (React) and backend (FastAPI)

## Project Structure
```
backend/    # FastAPI backend, database, and API logic
frontend/   # React frontend app
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (optional, for containerized setup)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend server:
   ```bash
   uvicorn backend.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend app:
   ```bash
   npm start
   ```

### Docker Compose (Optional)
To run both frontend and backend with Docker:
```bash
docker-compose up --build
```

## Usage
- Go to the frontend URL (default: http://localhost:3000)
- Sign up or log in
- Upload your Kindle clippings or vocab database
- Review and manage your flashcards and highlights

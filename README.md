# Green Habit Coach

A full-stack web app that analyzes daily habits and provides AI-powered eco-friendly suggestions and follow-up coaching.

## Features

- Habit analysis with eco score, summary, suggestions, and 7-day challenge plan
- History tracking for previous analysis records
- AI coach for follow-up questions
- Auth0 login authentication
- Cloud deployment with Firebase Hosting and Google Cloud Run

## Tech Stack

- Frontend: React, Vite, JavaScript
- Backend: FastAPI, Python, SQLAlchemy, SQLite
- Auth: Auth0
- AI: Backboard API
- Deployment: Firebase Hosting, Google Cloud Run

## Project Structure

```bash
green-habit-coach/
├─ backend/
├─ frontend/
├─ firebase.json
└─ README.md
```
## Local Setup
### Backend
```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --port 8080
```
### Frontend
```bash
cd frontend
npm install
npm run dev
```
## Environment Variables
### Frontend
```bash
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=your_auth0_audience
VITE_API_BASE_URL=your_backend_base_url
```

### Backend
```bash
AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_auth0_audience
GEMINI_API_KEY=your_gemini_api_key
USE_GEMINI=false
BACKBOARD_API_KEY=your_backboard_api_key
BACKBOARD_ASSISTANT_ID=your_backboard_assistant_id
```

## Deployment
### Frontend
```bash
cd frontend
npm run build
cd ..
npx firebase-tools deploy
```
### Backend
```bash
gcloud run deploy green-habit-backend \
  --source . \
  --region asia-east1 \
  --allow-unauthenticated
```
## Future Improvements
* Shorter and more focused coach replies
* Better UI styling
* Trend charts for history
* CI/CD pipeline
* Production database upgrade
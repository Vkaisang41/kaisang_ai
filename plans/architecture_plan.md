# Kaisang AI Web App Dashboard Architecture Plan

## Overview
The Kaisang AI web app is a dashboard for interacting with an AI chatbot, managing projects, searching, viewing images, and user settings. It builds on the existing FastAPI backend with a scikit-learn based intent classification model, expanding it into a full-stack application with React frontend, database, authentication, and real-time features.

## Existing Codebase Analysis
- **Backend**: FastAPI app with a single `/predict` endpoint for text prediction using a trained LogisticRegression model on intents.json data.
- **AI Model**: Scikit-learn model (model.pkl, vectorizer.pkl) trained on simple intents (greeting, goodbye, thanks, identity).
- **Frontend**: Basic static HTML page with JavaScript for chat interface.
- **Data**: intents.json with patterns and responses.
- **Dependencies**: FastAPI, scikit-learn, numpy, pandas, etc.

## Backend Architecture

### Framework
- **FastAPI**: For REST API and WebSocket support.
- **Database**: SQLite for development simplicity; can scale to PostgreSQL for production.
- **Authentication**: JWT-based authentication using `python-jose` or similar.
- **WebSocket**: For real-time chat using FastAPI's WebSocket support.
- **Additional Libraries**:
  - `sqlalchemy` for ORM.
  - `alembic` for migrations.
  - `passlib` for password hashing.
  - `python-multipart` for file uploads (images).

### Database Models
Using SQLAlchemy models:

- **User**:
  - id: Integer (PK)
  - username: String (unique)
  - email: String (unique)
  - hashed_password: String
  - created_at: DateTime
  - is_active: Boolean

- **Project**:
  - id: Integer (PK)
  - name: String
  - description: Text
  - user_id: Integer (FK to User)
  - created_at: DateTime

- **Chat**:
  - id: Integer (PK)
  - user_id: Integer (FK to User)
  - project_id: Integer (FK to Project, nullable)
  - messages: JSON (list of {role: str, content: str, timestamp: datetime})
  - created_at: DateTime

- **Image**:
  - id: Integer (PK)
  - filename: String
  - path: String
  - user_id: Integer (FK to User)
  - project_id: Integer (FK to Project, nullable)
  - uploaded_at: DateTime

- **SearchQuery**:
  - id: Integer (PK)
  - query: String
  - user_id: Integer (FK to User)
  - results: JSON
  - timestamp: DateTime

### API Endpoints
- **Authentication**:
  - POST /auth/register: Create new user account.
  - POST /auth/login: Authenticate and return JWT token.
  - POST /auth/refresh: Refresh JWT token.

- **Chat**:
  - WebSocket /ws/chat/{chat_id}: Real-time chat for a specific chat session.
  - GET /chats: List user's chats.
  - POST /chats: Create new chat.
  - GET /chats/{id}: Get chat details.
  - DELETE /chats/{id}: Delete chat.

- **Projects**:
  - GET /projects: List user's projects.
  - POST /projects: Create new project.
  - GET /projects/{id}: Get project details.
  - PUT /projects/{id}: Update project.
  - DELETE /projects/{id}: Delete project.

- **Images**:
  - GET /images: List user's images.
  - POST /images/upload: Upload image.
  - GET /images/{id}: Get image details.
  - DELETE /images/{id}: Delete image.

- **Search**:
  - POST /search: Perform search query (integrate with AI or external API).
  - GET /search/history: Get search history.

- **Settings**:
  - GET /settings: Get user settings.
  - PUT /settings: Update user settings.

- **Account**:
  - GET /account: Get account info.
  - PUT /account: Update account (e.g., password, email).
  - DELETE /account: Delete account.

### Integration with Existing AI Model
- The existing `predict` function from `app/predict.py` will be integrated into the chat WebSocket handler.
- For each user message in chat, call `predict(text)` to get AI response.
- Store chat history in DB for persistence.

## Frontend Architecture

### Framework
- **React**: For building the UI components.
- **TailwindCSS**: For styling.
- **React Router**: For client-side routing.
- **State Management**: React Context or Redux for global state (auth, user data).
- **HTTP Client**: Axios for API calls.
- **WebSocket Client**: Use `react-use-websocket` or native WebSocket for real-time chat.

### Component Structure
- **App**: Main app component with routing.
- **Layout**: Common layout with sidebar navigation and header.
- **Dashboard**: Overview page with stats, recent chats, projects.
- **ChatInterface**: Chat component with message list, input, WebSocket integration.
- **Search**: Search page with query input and results display.
- **Images**: Gallery view of uploaded images, upload form.
- **Projects**: List of projects, create/edit forms.
- **Settings**: User settings form.
- **Account**: Account management (profile, password change).
- **Auth**: Login/Register forms.

### UI Flow
1. User logs in via /login.
2. Redirect to /dashboard.
3. Navigation: Sidebar with links to Chat, Search, Images, Projects, Settings, Account.
4. Chat: Real-time interface, messages stored and retrieved from API.
5. Other sections: CRUD operations via API calls.

## Security Considerations
- **Authentication**: JWT tokens for API access, refresh tokens for session management.
- **Authorization**: Check user ownership for resources (e.g., only user can access their chats).
- **Input Validation**: Use Pydantic models for API inputs, sanitize user inputs.
- **CORS**: Configure CORS in FastAPI for frontend origin.
- **HTTPS**: Enforce in production.
- **Rate Limiting**: Implement on API endpoints.
- **Data Encryption**: Hash passwords, encrypt sensitive data if needed.

## Deployment Considerations
- **Containerization**: Use Docker for backend and frontend.
- **Backend Deployment**: Deploy FastAPI with uvicorn/gunicorn on a server (e.g., AWS EC2, Heroku).
- **Frontend Deployment**: Build React app and serve static files (e.g., via Nginx, or integrate with backend).
- **Database**: SQLite for dev, PostgreSQL for prod with connection pooling.
- **Environment Variables**: Use for secrets (JWT secret, DB URL).
- **CI/CD**: GitHub Actions for automated testing and deployment.
- **Monitoring**: Add logging, error tracking (e.g., Sentry).
- **Scaling**: Use async for WebSockets, consider load balancer for multiple instances.

## Integration Points
- **AI Model**: Directly call `predict` in chat handler; consider expanding intents.json for more responses.
- **External APIs**: For search/images if needed (e.g., integrate with Google Search API or image services).
- **File Storage**: For images, use local storage or cloud (e.g., AWS S3).

## Next Steps
- Implement backend with DB models and endpoints.
- Build React frontend with components.
- Integrate WebSocket for chat.
- Add authentication middleware.
- Test and deploy.
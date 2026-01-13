from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, UploadFile, File, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel
from app.predict import predict
import os
import json
import shutil
import requests
from openai import OpenAI

# Database setup
DATABASE_URL = "sqlite:///./kaisang.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    chats = relationship("Chat", back_populates="user")
    projects = relationship("Project", back_populates="user")
    images = relationship("Image", back_populates="user")
    search_queries = relationship("SearchQuery", back_populates="user")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="projects")
    chats = relationship("Chat", back_populates="project")
    images = relationship("Image", back_populates="project")

class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    messages = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="chats")
    project = relationship("Project", back_populates="chats")

class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    path = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="images")
    project = relationship("Project", back_populates="images")

class SearchQuery(Base):
    __tablename__ = "search_queries"
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    results = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="search_queries")

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth setup
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password, hashed_password):
    # Truncate to 72 bytes (not characters) to match bcrypt's limit
    truncated_password = plain_password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.verify(truncated_password, hashed_password)

def get_password_hash(password):
    # Truncate to 72 bytes (not characters) to comply with bcrypt limit
    truncated_password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(truncated_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ProjectCreate(BaseModel):
    name: str
    description: str

class ProjectUpdate(BaseModel):
    name: str = None
    description: str = None

class ChatCreate(BaseModel):
    project_id: int = None

class SearchRequest(BaseModel):
    query: str
    date_from: str = None
    date_to: str = None
    chat_id: int = None

class Settings(BaseModel):
    theme: str = "light"
    notifications: bool = True

class ImageGenerate(BaseModel):
    prompt: str
    project_id: int = None

# App
app = FastAPI(title="Kaisang AI")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Cannot use credentials with wildcard origin
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Auth endpoints
@app.post("/auth/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username taken")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email taken")
    hashed = get_password_hash(user.password)
    db_user = User(username=user.username, email=user.email, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

# Chat endpoints
@app.get("/chats")
def get_chats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Chat).filter(Chat.user_id == current_user.id).all()

@app.post("/chats")
def create_chat(chat: ChatCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_chat = Chat(user_id=current_user.id, project_id=chat.project_id, messages=[])
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat

@app.get("/chats/{chat_id}")
def get_chat(chat_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@app.delete("/chats/{chat_id}")
def delete_chat(chat_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()
    return {"message": "Deleted"}

# WebSocket for chat
@app.websocket("/ws/chat/{chat_id}")
async def websocket_chat(chat_id: int, websocket: WebSocket, token: str = Query(None), db: Session = Depends(get_db)):
    await websocket.accept()
    # Authenticate user
    if not token:
        await websocket.close(code=1008)
        return
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            await websocket.close(code=1008)
            return
        user = db.query(User).filter(User.username == username).first()
        if not user:
            await websocket.close(code=1008)
            return
    except JWTError:
        await websocket.close(code=1008)
        return

    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
    if not chat:
        await websocket.close(code=1008)
        return
    try:
        while True:
            data = await websocket.receive_text()
            response = predict(data)
            message_user = {"role": "user", "content": data, "timestamp": str(datetime.utcnow())}
            message_ai = {"role": "ai", "content": response, "timestamp": str(datetime.utcnow())}
            chat.messages.append(message_user)
            chat.messages.append(message_ai)
            db.commit()
            await websocket.send_text(json.dumps(message_ai))
    except WebSocketDisconnect:
        pass

# Projects endpoints
@app.get("/projects")
def get_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Project).filter(Project.user_id == current_user.id).all()

@app.post("/projects")
def create_project(project: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_project = Project(name=project.name, description=project.description, user_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects/{project_id}")
def get_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.put("/projects/{project_id}")
def update_project(project_id: int, project: ProjectUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.name:
        db_project.name = project.name
    if project.description:
        db_project.description = project.description
    db.commit()
    return db_project

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Deleted"}

# Images endpoints
@app.get("/images")
def get_images(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Image).filter(Image.user_id == current_user.id).all()

@app.post("/images/upload")
def upload_image(file: UploadFile = File(...), project_id: int = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    os.makedirs("uploads", exist_ok=True)
    path = f"uploads/{file.filename}"
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    db_image = Image(filename=file.filename, path=path, user_id=current_user.id, project_id=project_id)
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

@app.get("/images/{image_id}")
def get_image(image_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    image = db.query(Image).filter(Image.id == image_id, Image.user_id == current_user.id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image

@app.delete("/images/{image_id}")
def delete_image(image_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    image = db.query(Image).filter(Image.id == image_id, Image.user_id == current_user.id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    os.remove(image.path)
    db.delete(image)
    db.commit()
    return {"message": "Deleted"}

@app.post("/images/generate")
def generate_image(request: ImageGenerate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        # Mock response for development
        os.makedirs("uploads", exist_ok=True)
        timestamp = int(datetime.utcnow().timestamp())
        filename = f"mock_generated_{current_user.id}_{timestamp}.png"
        path = f"uploads/{filename}"
        # Create a simple mock image (1x1 pixel PNG)
        with open(path, "wb") as f:
            f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB`\x82')
        # Save to DB
        db_image = Image(filename=filename, path=path, user_id=current_user.id, project_id=request.project_id)
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        return db_image
    client = OpenAI(api_key=openai_api_key)
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=request.prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url
        # Download the image
        img_response = requests.get(image_url)
        img_response.raise_for_status()
        os.makedirs("uploads", exist_ok=True)
        timestamp = int(datetime.utcnow().timestamp())
        filename = f"generated_{current_user.id}_{timestamp}.png"
        path = f"uploads/{filename}"
        with open(path, "wb") as f:
            f.write(img_response.content)
        # Save to DB
        db_image = Image(filename=filename, path=path, user_id=current_user.id, project_id=request.project_id)
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        return db_image
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

# Search endpoints
@app.post("/search")
def perform_search(search: SearchRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Chat).filter(Chat.user_id == current_user.id)
    if search.chat_id:
        query = query.filter(Chat.id == search.chat_id)
    if search.date_from:
        date_from = datetime.fromisoformat(search.date_from.replace('Z', '+00:00'))
        query = query.filter(Chat.created_at >= date_from)
    if search.date_to:
        date_to = datetime.fromisoformat(search.date_to.replace('Z', '+00:00'))
        query = query.filter(Chat.created_at <= date_to)
    chats = query.all()
    # Filter by query in messages
    results = []
    for chat in chats:
        if search.query:
            found = False
            for msg in chat.messages:
                if search.query.lower() in msg.get('content', '').lower():
                    found = True
                    break
            if not found:
                continue
        results.append({
            "id": chat.id,
            "created_at": chat.created_at.isoformat(),
            "messages": chat.messages[-5:]  # last 5 messages as preview
        })
    db_query = SearchQuery(query=search.query, user_id=current_user.id, results={"results": results})
    db.add(db_query)
    db.commit()
    return {"results": results}

@app.get("/search/history")
def get_search_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SearchQuery).filter(SearchQuery.user_id == current_user.id).all()

# Settings endpoints
@app.get("/settings")
def get_settings(current_user: User = Depends(get_current_user)):
    # Mock settings
    return {"theme": "light", "notifications": True}

@app.put("/settings")
def update_settings(settings: Settings, current_user: User = Depends(get_current_user)):
    # Mock update
    return settings

# Account endpoints
@app.get("/account")
def get_account(current_user: User = Depends(get_current_user)):
    return {"username": current_user.username, "email": current_user.email}

@app.put("/account")
def update_account(email: str = None, password: str = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if email:
        current_user.email = email
    if password:
        current_user.hashed_password = get_password_hash(password)
    db.commit()
    return {"message": "Updated"}

@app.delete("/account")
def delete_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted"}

# Keep old predict for compatibility
class Query(BaseModel):
    text: str

@app.post("/predict")
def get_prediction(query: Query):
    response = predict(query.text)
    return {"input": query.text, "response": response}

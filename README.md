# Kaisang AI

Kaisang AI is a full-stack web application that provides an intelligent AI assistant with chat functionality, image generation, project management, and search capabilities. Built with FastAPI for the backend and React for the frontend.

## Features

- **AI Chat**: Real-time chat with AI using WebSocket connections
- **Image Generation**: Generate images using OpenAI's DALL-E (requires API key)
- **Project Management**: Organize your work with projects
- **Search Functionality**: Search through chat history
- **User Authentication**: Secure login and registration
- **Responsive UI**: Modern, clean interface built with React and Tailwind CSS

## Tech Stack

### Backend
- **FastAPI**: High-performance web framework for building APIs
- **SQLAlchemy**: ORM for database operations
- **SQLite**: Database for storing user data, chats, projects, etc.
- **WebSocket**: Real-time communication for chat
- **JWT**: Token-based authentication
- **OpenAI API**: For image generation
- **Scikit-learn**: Machine learning model for chat responses

### Frontend
- **React**: JavaScript library for building user interfaces
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **React Router**: Client-side routing

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Vkaisang41/kaisang_ai.git
   cd kaisang_ai
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. (Optional) Set up OpenAI API key for image generation:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

## Usage

### Running the Application

1. Start the backend server:
   ```bash
   # From the root directory
   ./venv/bin/uvicorn app.api:app --reload
   ```
   The backend will be available at `http://127.0.0.1:8000`

2. Start the frontend development server:
   ```bash
   # From the frontend directory
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

3. Open your browser and navigate to `http://localhost:5173`

### API Documentation

When the backend is running, you can access the API documentation at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Project Structure

```
kaisang_ai/
├── app/                    # Backend application
│   ├── api.py             # Main API endpoints
│   ├── predict.py         # AI prediction logic
│   ├── train.py           # Model training script
│   └── static/            # Static files
├── data/                  # Data files
│   └── intents.json       # Chat intents and responses
├── frontend/              # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   └── public/            # Public assets
├── models/                # Machine learning models
├── plans/                 # Project planning documents
├── uploads/               # User uploaded files
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key for image generation
- `SECRET_KEY`: Secret key for JWT token signing (auto-generated if not set)

### Database

The application uses SQLite by default. The database file `kaisang.db` will be created automatically on first run.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built by Vincent
- Powered by OpenAI's API
- Inspired by modern AI assistant applications

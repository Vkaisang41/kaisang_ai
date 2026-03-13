import pickle
import random
import json
import re
import os
import logging
from openai import OpenAI

logging.basicConfig(filename='ai_telemetry.log', level=logging.INFO, format='%(asctime)s - %(message)s')

# Load model and vectorizer (kept for backward compatibility)
with open("models/model.pkl", "rb") as f:
    model = pickle.load(f)

with open("models/vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# Load intents (kept for fallback)
with open("data/intents.json") as f:
    intents = json.load(f)

# OpenAI client setup
openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key) if openai_api_key else None

# System prompt for the AI assistant
SYSTEM_PROMPT = """You are a helpful, friendly, and knowledgeable AI assistant like ChatGPT. 
You can answer questions on a wide variety of topics including:
- Programming and software development
- Mathematics and science
- History and geography
- General knowledge and trivia
- Creative writing and analysis
- Problem-solving and explanations

Be clear, accurate, and provide helpful responses. If you don't know something, be honest about it.
Always try to be as helpful and informative as possible."""


def remove_emojis(text):
    """Remove emojis from text"""
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "\U00002700-\U000027BF"  # dingbats
        "\U0001f926-\U0001f937"  # gestures
        "\U00010000-\U0010ffff"  # other unicode
        "\u2640-\u2642"  # gender symbols
        "\u2600-\u2B55"  # misc symbols
        "\u200d"  # zero width joiner
        "\u23cf"  # eject symbol
        "\u23e9"  # fast forward
        "\u231a"  # watch
        "\ufe0f"  # variation selector
        "\u3030"  # wavy dash
        "]+",
        flags=re.UNICODE
    )
    return emoji_pattern.sub('', text)


def get_intent_response(tag):
    """Get response from intents.json for a specific tag"""
    for intent in intents["intents"]:
        if intent["tag"] == tag:
            response = random.choice(intent["responses"])
            return remove_emojis(response)
    return None


def get_gpt_response(user_message: str, conversation_history: list = None) -> dict:
    """
    Get response from OpenAI's GPT model.
    This is the main function that makes your AI like ChatGPT.
    
    Args:
        user_message: The current user message
        conversation_history: List of previous messages in format [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
    
    Returns:
        dict with response information
    """
    if not openai_api_key or not client:
        return {
            "type": "text",
            "content": "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable to enable AI responses.",
            "source": "no_api_key"
        }
    
    try:
        # Build messages array with system prompt and conversation history
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Add conversation history (last 10 messages for context)
        if conversation_history:
            for msg in conversation_history[-10:]:
                if isinstance(msg, dict):
                    messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
                elif isinstance(msg, str):
                    # Handle legacy string format
                    messages.append({"role": "user", "content": msg})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Fast and cost-effective
            messages=messages,
            temperature=0.7,  # Creative but grounded
            max_tokens=2000,  # Allow detailed responses
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        # Extract response content
        content = response.choices[0].message.content
        content = remove_emojis(content)
        
        logging.info(f"GPT Response: {len(content)} chars, Source: gpt")
        
        return {
            "type": "text",
            "content": content,
            "source": "gpt",
            "model": "gpt-3.5-turbo"
        }
        
    except Exception as e:
        logging.error(f"GPT API Error: {str(e)}")
        return {
            "type": "text",
            "content": f"I apologize, but I encountered an error: {str(e)}. Please try again.",
            "source": "error",
            "error": str(e)
        }


def predict(text: str, conversation_history: list = None) -> dict:
    """
    Main prediction function.
    Now uses GPT for all responses to provide ChatGPT-like experience.
    
    Args:
        text: User's message
        conversation_history: Previous messages for context
    
    Returns:
        dict with response
    """
    # Use GPT for all responses (ChatGPT-like)
    return get_gpt_response(text, conversation_history)


# Legacy function for backward compatibility
def get_response(tag):
    return get_intent_response(tag)

import pickle
import random
import json
import re

# Load model and vectorizer
with open("models/model.pkl", "rb") as f:
    model = pickle.load(f)

with open("models/vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# Load intents
with open("data/intents.json") as f:
    intents = json.load(f)

def remove_emojis(text):
    # Regex to match emojis
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

def get_response(tag):
    for intent in intents["intents"]:
        if intent["tag"] == tag:
            response = random.choice(intent["responses"])
            return remove_emojis(response)
    return "I don't understand..."

def predict(text: str) -> str:
    X = vectorizer.transform([text])
    tag = model.predict(X)[0]
    return get_response(tag)

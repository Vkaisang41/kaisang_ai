import json
import pickle
import random

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


def load_data(path):
    with open(path) as f:
        data = json.load(f)
    return data["intents"]


def prepare_data(intents):
    texts = []
    labels = []

    for intent in intents:
        for pattern in intent["patterns"]:
            texts.append(pattern)
            labels.append(intent["tag"])

    return texts, labels


def train():
    intents = load_data("data/intents.json")
    texts, labels = prepare_data(intents)

    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(texts)

    model = LogisticRegression(max_iter=1000)
    model.fit(X, labels)

    with open("models/vectorizer.pkl", "wb") as f:
        pickle.dump(vectorizer, f)

    with open("models/model.pkl", "wb") as f:
        pickle.dump(model, f)

    print("✅ Kaisang AI trained successfully")


if __name__ == "__main__":
    train()

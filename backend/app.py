from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re
import os

app = Flask(__name__)
CORS(app)

# Get backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Model folder inside backend/
MODEL_DIR = os.path.join(BASE_DIR, "model")

model = joblib.load(os.path.join(MODEL_DIR, "fake_news_model.pkl"))
vectorizer = joblib.load(os.path.join(MODEL_DIR, "vectorizer.pkl"))

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

@app.get("/")
def home():
    return "Fake News Detector API is running!"

@app.post("/predict")
def predict():
    data = request.get_json()
    input_text = data.get("text", "")

    cleaned = clean_text(input_text)
    text_vec = vectorizer.transform([cleaned])
    proba = model.predict_proba(text_vec)[0]

    fake_prob = float(proba[1])
    label = "FAKE" if fake_prob >= 0.5 else "REAL"
    confidence = fake_prob if label == "FAKE" else 1 - fake_prob

    return jsonify({
        "label": label,
        "probability": round(confidence, 3),
        "input_text": input_text
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)

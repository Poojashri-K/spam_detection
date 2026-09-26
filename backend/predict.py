import re
from pathlib import Path

import joblib
from severity import analyze_severity


def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", " URL ", text)
    text = re.sub(r"\d+", " NUMBER ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def predict_message(message):
    models_dir = Path(__file__).resolve().parent / "models"
    svm_model = joblib.load(models_dir / "svm_model.pkl")
    vectorizer = joblib.load(models_dir / "tfidf_vectorizer.pkl")

    cleaned_message = clean_text(message)
    message_features = vectorizer.transform([cleaned_message])
    prediction = svm_model.predict(message_features)[0]

    return "spam" if prediction == 1 else "ham"


def identify_features(message):
    features = []
    text = message.lower()

    urls = re.findall(r"\b(?:https?://|www\.)\S+", message, re.IGNORECASE)
    suspicious_urls = []
    for url in urls:
        normalized_url = url.rstrip(".,!?;:)")
        lower_url = normalized_url.lower()
        if (
            lower_url.startswith("http://")
            or any(domain in lower_url for domain in ("bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly"))
            or re.search(r"https?://(?:\d{1,3}\.){3}\d{1,3}", normalized_url, re.IGNORECASE)
            or "xn--" in lower_url
        ):
            suspicious_urls.append(normalized_url)
    if suspicious_urls:
        features.append("Suspicious URL: " + ", ".join(suspicious_urls))

    categories = (
        ("Urgency", r"\b(urgent(?:ly)?|immediately|act now|right away|asap|now|today|expires?|within \d+ hours?)\b"),
        ("Financial terms", r"\b(payment|pay|transfer|wire|money|fee|billing|bank|loan|credit|debit|gift card)\b"),
        ("Credential terms", r"\b(passwords?|passcodes?|otps?|pins?|credentials?|card details|login details)\b"),
        ("Account/security terms", r"\b(accounts?|security|secure|blocked|block|suspended|suspend|locked|lock|verify|verification|unusual activity|alert)\b"),
        ("Prize/reward terms", r"\b(prize|rewards?|winner|winning|won|lottery|giveaway|claim)\b"),
    )

    for category, pattern in categories:
        matches = list(dict.fromkeys(match.group(0).lower() for match in re.finditer(pattern, text)))
        if matches:
            features.append(f"{category}: {', '.join(matches)}")

    return features


def analyze_message(message):
    prediction = predict_message(message)
    severity_result = analyze_severity(message)
    features = identify_features(message)

    svm_model = joblib.load(Path(__file__).resolve().parent / "models" / "svm_model.pkl")
    if not hasattr(svm_model, "predict_proba"):
        raise RuntimeError(
            "The saved SVM model does not support probability estimates. "
            "Train and save it with SVC(probability=True) to enable confidence."
        )

    vectorizer = joblib.load(Path(__file__).resolve().parent / "models" / "tfidf_vectorizer.pkl")
    message_features = vectorizer.transform([clean_text(message)])
    predicted_class = 1 if prediction == "spam" else 0
    class_index = list(svm_model.classes_).index(predicted_class)
    confidence = round(float(svm_model.predict_proba(message_features)[0][class_index]) * 100, 2)

    return {
        "prediction": prediction,
        "severity": severity_result["level"],
        "reasons": severity_result["reasons"],
        "features": features,
        "confidence": confidence,
    }


if __name__ == "__main__":
    test_message = "URGENT! Your bank account will be blocked. Verify your OTP immediately at http://example.com"
    print(analyze_message(test_message))

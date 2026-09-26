from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
import joblib
import json
import os
import pandas as pd
import re

# Load dataset
df = pd.read_csv(
    "data/SMSSpamCollection",
    sep="\t",
    header=None,
    names=["label", "message"]
)

# Convert labels into numbers
# ham = 0, spam = 1
df["label"] = df["label"].map({
    "ham": 0,
    "spam": 1
})


# Text cleaning function
def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", " URL ", text)
    text = re.sub(r"\d+", " NUMBER ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


# Apply cleaning
df["clean_message"] = df["message"].apply(clean_text)

# Convert text into numerical TF-IDF features
vectorizer = TfidfVectorizer(
    max_features=5000,
    stop_words="english"
)

X = vectorizer.fit_transform(df["clean_message"])
y = df["label"]

# Split features and labels into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Train and evaluate Logistic Regression
model = LogisticRegression(random_state=42, max_iter=1000)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print("\nLogistic Regression evaluation:")
print("Accuracy:", accuracy_score(y_test, y_pred))
print("Precision:", precision_score(y_test, y_pred))
print("Recall:", recall_score(y_test, y_pred))
print("F1-score:", f1_score(y_test, y_pred))
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Train and evaluate Multinomial Naive Bayes
nb_model = MultinomialNB()
nb_model.fit(X_train, y_train)
nb_y_pred = nb_model.predict(X_test)

print("\nMultinomial Naive Bayes evaluation:")
print("Accuracy:", accuracy_score(y_test, nb_y_pred))
print("Precision:", precision_score(y_test, nb_y_pred))
print("Recall:", recall_score(y_test, nb_y_pred))
print("F1-score:", f1_score(y_test, nb_y_pred))
print("Confusion Matrix:")
print(confusion_matrix(y_test, nb_y_pred))

# Train and evaluate SVM
svm_model = SVC(
    kernel="linear",
    random_state=42,
    probability=True
)
svm_model.fit(X_train, y_train)
svm_y_pred = svm_model.predict(X_test)

print("\nSVM evaluation")
print("Accuracy:", accuracy_score(y_test, svm_y_pred))
print("Precision:", precision_score(y_test, svm_y_pred))
print("Recall:", recall_score(y_test, svm_y_pred))
print("F1-score:", f1_score(y_test, svm_y_pred))
print("Confusion Matrix:")
print(confusion_matrix(y_test, svm_y_pred))

# Save the trained SVM model and fitted TF-IDF vectorizer
os.makedirs("models", exist_ok=True)
joblib.dump(svm_model, "models/svm_model.pkl")
joblib.dump(vectorizer, "models/tfidf_vectorizer.pkl")
print("Saved SVM model to models/svm_model.pkl")
print("Saved TF-IDF vectorizer to models/tfidf_vectorizer.pkl")

# Compare model evaluation metrics
comparison_df = pd.DataFrame([
    {
        "Model": "Logistic Regression",
        "Accuracy": accuracy_score(y_test, y_pred),
        "Precision": precision_score(y_test, y_pred),
        "Recall": recall_score(y_test, y_pred),
        "F1-score": f1_score(y_test, y_pred)
    },
    {
        "Model": "Multinomial Naive Bayes",
        "Accuracy": accuracy_score(y_test, nb_y_pred),
        "Precision": precision_score(y_test, nb_y_pred),
        "Recall": recall_score(y_test, nb_y_pred),
        "F1-score": f1_score(y_test, nb_y_pred)
    },
    {
        "Model": "SVM",
        "Accuracy": accuracy_score(y_test, svm_y_pred),
        "Precision": precision_score(y_test, svm_y_pred),
        "Recall": recall_score(y_test, svm_y_pred),
        "F1-score": f1_score(y_test, svm_y_pred)
    }
], columns=["Model", "Accuracy", "Precision", "Recall", "F1-score"])

print("\nModel comparison:")
print(comparison_df)

metrics_data = [
    {
        "Model": row["Model"],
        "accuracy": float(row["Accuracy"]),
        "precision": float(row["Precision"]),
        "recall": float(row["Recall"]),
        "f1_score": float(row["F1-score"]),
        "confusion_matrix": confusion_matrix(y_test, predictions).tolist(),
    }
    for (_, row), predictions in zip(
        comparison_df.iterrows(),
        (y_pred, nb_y_pred, svm_y_pred)
    )
]
os.makedirs("models", exist_ok=True)
with open("models/model_metrics.json", "w", encoding="utf-8") as metrics_file:
    json.dump(metrics_data, metrics_file, indent=4)
print("Saved model comparison metrics to models/model_metrics.json")

print("\nTF-IDF feature matrix shape:")
print(X.shape)
print("X_train shape:", X_train.shape)
print("X_test shape:", X_test.shape)
print("y_train shape:", y_train.shape)
print("y_test shape:", y_test.shape)


# Display examples
print("Original messages:\n")
print(df["message"].head(5))

print("\nCleaned messages:\n")
print(df["clean_message"].head(5))

print("\nLabel distribution:")
print(df["label"].value_counts())

from pathlib import Path

from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from scipy.sparse import hstack, vstack
import joblib
import json
import numpy as np
import pandas as pd
import re

# Load dataset
backend_dir = Path(__file__).resolve().parent
data_dir = backend_dir / "data"
models_dir = backend_dir / "models"
df = pd.read_csv(data_dir / "combined_messages_v2.csv", encoding="utf-8")
df = df.rename(columns={"text": "message"})[["label", "message"]]

# Convert labels into numbers
# ham = 0, spam = 1
df["label"] = df["label"].map({
    "ham": 0,
    "spam": 1
})
df = df.dropna(subset=["label", "message"])
df["message"] = df["message"].astype(str)


# Text cleaning function
def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", " URL ", text)
    text = re.sub(r"(?<![@\w])(?:[a-z0-9-]+\.)+[a-z]{2,}\b", " URL ", text)

    def normalize_number(match):
        preceding_word = re.search(
            r"([a-zA-Z]+)[^a-zA-Z0-9_]*$",
            text[:match.start()],
        )
        if preceding_word:
            return f" number_{preceding_word.group(1)} "
        return " number "

    text = re.sub(r"\d+(?:[.,:/-]\d+)*", normalize_number, text)
    text = re.sub(r"[^a-zA-Z_\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


TRANSACTIONAL_HAM_EXAMPLES = [
    "Your statement is ready in the banking app. No action is needed.",
    "A deposit was credited to your account. View the updated balance in your app.",
    "Your salary deposit has been processed and is now reflected in your account.",
    "Your card payment was received. The remaining balance is available in your account.",
    "Your electricity bill payment was successful. A receipt is available in the app.",
    "Your water bill is due tomorrow. View the amount and payment history in the utility app.",
    "Your mobile recharge was successful. The plan is valid for 28 days.",
    "Your order has been confirmed. We will send an update when it ships.",
    "Your package is out for delivery today. Check its status in the shopping app.",
    "Your parcel has been delivered. Thank you for your order.",
    "Your delivery is scheduled for tomorrow between 10 AM and 1 PM.",
    "Your return request was accepted. The courier pickup is scheduled for Friday.",
    "Your refund has been processed and should appear within five business days.",
    "Your train ticket is confirmed. Check the PNR and departure time in the rail app.",
    "Your flight booking is confirmed. Online check in opens 24 hours before departure.",
    "Your bus ticket is booked for tomorrow. Your seat number is on the ticket.",
    "Your appointment is confirmed for Tuesday at 10:30 AM. Reply R to reschedule.",
    "Reminder: your dental appointment is tomorrow afternoon. Contact the clinic to change it.",
    "Your prescription is ready for collection at the pharmacy.",
    "Your lab test report is available in the patient portal.",
    "Your subscription renewal was successful. Your next billing date is next month.",
    "Your automatic monthly payment was received. A receipt is available in your account.",
    "Your service request was received. The technician will arrive between 2 PM and 4 PM.",
    "The technician visit is confirmed for Thursday morning. Reply C to confirm.",
    "Your library book is due back next week. Renew it in the library app if needed.",
    "Your return parcel pickup is complete and the package is on its way to the warehouse.",
    "Your one time password expires in five minutes. Never share this code with anyone.",
    "Your sign in verification code is ready. Ignore this message if you did not request it.",
    "Your transfer to a saved contact is complete. View the receipt in your banking app.",
    "Your monthly loan installment was received. The next due date is November 5.",
    "Your insurance premium payment is confirmed. The receipt is ready in the customer portal.",
    "Your booking has been changed to 6:30 PM. View the updated details in the travel app.",
    "Your electricity service appointment is booked for Monday. No reply is needed.",
    "A delivery attempt was made today. The next attempt is scheduled for tomorrow.",
    "Your transaction was completed successfully. This is your payment receipt.",
    "Your account was debited for a card purchase at a local store. View details in your app.",
    "Your account balance was updated after your monthly subscription payment.",
    "A verification code was sent for your requested sign in. Do not share the code.",
    "Your OTP for completing a transaction is 482913. Do not share this OTP with anyone.",
    "Your OTP is required to complete your payment. Never share it.",
    "Use this OTP to complete your transaction. Do not disclose it to anyone.",
    "Your verification code is valid for five minutes. Do not share the code.",
    "OTP generated for your login. Never share this OTP with anyone.",
]

TRANSACTIONAL_HAM_EVALUATION_MESSAGES = [
    "Your order has been packed and is expected to arrive on Wednesday.",
    "A payment of Rs 860 was received for your monthly phone service.",
    "Your account was credited with the reimbursement from your employer.",
    "The clinic has moved your appointment to 11 AM on Friday.",
    "Your package was delivered to the reception desk.",
    "Your train reservation is confirmed. Open the rail app to view your seat.",
    "Your monthly statement can now be viewed in online banking.",
    "We have received your return and started processing the refund.",
    "Your water service payment is complete. Keep this message as your receipt.",
    "Your verification code is 481205. It is for the sign in you just requested; never share it.",
    "Your prescription refill is ready. Collect it during pharmacy opening hours.",
    "Your home internet installation visit is scheduled for tomorrow morning.",
    "Your card payment was successful. The updated balance is available in your account.",
    "Your hotel reservation is confirmed for the dates selected in your booking.",
    "Your electricity bill is due next week. The bill can be viewed in the provider app.",
]
SPAM_CONTROL_MESSAGES = [
    "Urgent: your account is blocked. Verify your password and share your OTP now to restore access."
]

# Hold out test messages before fitting either vectorizer.
train_indices, test_indices = train_test_split(
    np.arange(len(df)),
    test_size=0.2,
    random_state=42,
    stratify=df["label"],
)
train_text = df.iloc[train_indices]["message"].tolist()
test_text = df.iloc[test_indices]["message"].tolist()
y_train = df.iloc[train_indices]["label"].to_numpy(dtype=int)
y_test = df.iloc[test_indices]["label"].to_numpy(dtype=int)
transactional_ham_clean = [clean_text(text) for text in TRANSACTIONAL_HAM_EXAMPLES]
train_clean = [clean_text(text) for text in train_text]
test_clean = [clean_text(text) for text in test_text]

# Convert text into combined word and character TF-IDF features.
word_vectorizer = TfidfVectorizer(
    max_features=10000,
    ngram_range=(1, 2),
    stop_words=sorted(ENGLISH_STOP_WORDS.difference({"not", "no", "never"}))
)
char_vectorizer = TfidfVectorizer(
    analyzer="char",
    ngram_range=(2, 5),
    max_features=10000
)
word_vectorizer.fit(train_clean + transactional_ham_clean)
char_vectorizer.fit(train_clean + transactional_ham_clean)

def combine_features(texts):
    word_features = word_vectorizer.transform(texts)
    char_features = char_vectorizer.transform(texts)
    return hstack([word_features, char_features], format="csr")


X_train = combine_features(train_clean)
X_transactional_ham = combine_features(transactional_ham_clean)
X_test = combine_features(test_clean)
X_train_augmented = vstack([X_train, X_transactional_ham], format="csr")
y_train_augmented = np.concatenate([
    y_train,
    np.zeros(len(TRANSACTIONAL_HAM_EXAMPLES), dtype=int),
])
training_sample_weights = np.concatenate([
    np.ones(len(y_train)),
    np.full(len(TRANSACTIONAL_HAM_EXAMPLES), 3.0),
])

# Train and evaluate Logistic Regression
model = LogisticRegression(random_state=42, max_iter=1000)
model.fit(X_train_augmented, y_train_augmented, sample_weight=training_sample_weights)
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
nb_model.fit(X_train_augmented, y_train_augmented, sample_weight=training_sample_weights)
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
svm_model.fit(X_train_augmented, y_train_augmented, sample_weight=training_sample_weights)
svm_y_pred = svm_model.predict(X_test)

print("\nSVM evaluation")
print("Accuracy:", accuracy_score(y_test, svm_y_pred))
print("Precision:", precision_score(y_test, svm_y_pred))
print("Recall:", recall_score(y_test, svm_y_pred))
print("F1-score:", f1_score(y_test, svm_y_pred))
print("Confusion Matrix:")
print(confusion_matrix(y_test, svm_y_pred))

transactional_eval_clean = [
    clean_text(text) for text in TRANSACTIONAL_HAM_EVALUATION_MESSAGES
]
transactional_eval_features = combine_features(transactional_eval_clean)
transactional_eval_predictions = svm_model.predict(transactional_eval_features)
transactional_false_positives = int(np.sum(transactional_eval_predictions == 1))
spam_control_predictions = svm_model.predict(
    combine_features([clean_text(text) for text in SPAM_CONTROL_MESSAGES])
)
print("\nTransactional HAM false positives:")
print(
    f"{transactional_false_positives}/{len(TRANSACTIONAL_HAM_EVALUATION_MESSAGES)} "
    "legitimate messages predicted as spam"
)
print(
    f"Spam control detected: {int(np.sum(spam_control_predictions == 1))}/"
    f"{len(SPAM_CONTROL_MESSAGES)}"
)

# Save the trained SVM model and fitted TF-IDF vectorizers
models_dir.mkdir(parents=True, exist_ok=True)
joblib.dump(svm_model, models_dir / "svm_model.pkl")
joblib.dump(word_vectorizer, models_dir / "word_tfidf_vectorizer.pkl")
joblib.dump(char_vectorizer, models_dir / "char_tfidf_vectorizer.pkl")
print("Saved SVM model to", models_dir / "svm_model.pkl")
print("Saved word TF-IDF vectorizer to", models_dir / "word_tfidf_vectorizer.pkl")
print("Saved character TF-IDF vectorizer to", models_dir / "char_tfidf_vectorizer.pkl")

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
with (models_dir / "model_metrics.json").open("w", encoding="utf-8") as metrics_file:
    json.dump(metrics_data, metrics_file, indent=4)
print("Saved model comparison metrics to models/model_metrics.json")

print("\nTF-IDF feature matrix shape:")
print(X_train_augmented.shape)
print("X_train shape:", X_train_augmented.shape)
print("X_test shape:", X_test.shape)
print("y_train shape:", y_train.shape)
print("y_test shape:", y_test.shape)


# Display examples
print("Original messages:\n")
print(df["message"].head(5))

print("\nCleaned messages:\n")
print(pd.Series(train_clean).head(5))

print("\nLabel distribution:")
print(df["label"].value_counts())

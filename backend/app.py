import json
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

from predict import analyze_message


app = Flask(__name__)
CORS(app)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/analyze")
def analyze():
    data = request.get_json(silent=True)
    message = data.get("message") if isinstance(data, dict) else None

    if not isinstance(message, str) or not message.strip():
        return jsonify({"error": "A non-empty message is required."}), 400

    try:
        result = analyze_message(message)
    except Exception as error:
        app.logger.exception("Message analysis failed")
        return jsonify({"error": str(error)}), 500

    return jsonify(result)


@app.get("/api/metrics")
def metrics():
    metrics_path = Path(__file__).resolve().parent / "models" / "model_metrics.json"
    try:
        with metrics_path.open("r", encoding="utf-8") as metrics_file:
            metrics_data = json.load(metrics_file)
    except (OSError, json.JSONDecodeError):
        return jsonify({"error": "Model metrics are unavailable or could not be read."}), 500

    return jsonify(metrics_data)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

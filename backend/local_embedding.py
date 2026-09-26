from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Embedding model loaded!")
print("Dimensions:", model.get_sentence_embedding_dimension())


@app.route("/embed", methods=["POST"])
def embed():

    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({
            "success": False,
            "message": "Text is required"
        }), 400

    embedding = model.encode(text).tolist()

    return jsonify({
        "success": True,
        "dimensions": len(embedding),
        "embedding": embedding
    })


@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "KnowVault local embedding service is running"
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=8000,
        debug=False
    )
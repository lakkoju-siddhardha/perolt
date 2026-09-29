from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, CrossEncoder

app = Flask(__name__)


# =========================
# Embedding Model
# =========================

print("Loading embedding model...")

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

print("Embedding model loaded!")
print("Dimensions:", embedding_model.get_sentence_embedding_dimension())


# =========================
# Reranker Model
# =========================

print("Loading reranker model...")

reranker_model = CrossEncoder(
    "cross-encoder/ms-marco-MiniLM-L-6-v2"
)

print("Reranker model loaded!")


# =========================
# Embedding Endpoint
# =========================

@app.route("/embed", methods=["POST"])
def embed():

    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({
            "success": False,
            "message": "Text is required"
        }), 400

    embedding = embedding_model.encode(text).tolist()

    return jsonify({
        "success": True,
        "dimensions": len(embedding),
        "embedding": embedding
    })


# =========================
# Reranker Endpoint
# =========================

@app.route("/rerank", methods=["POST"])
def rerank():

    data = request.json

    query = data.get("query", "")
    documents = data.get("documents", [])

    if not query:
        return jsonify({
            "success": False,
            "message": "Query is required"
        }), 400

    if not documents:
        return jsonify({
            "success": False,
            "message": "Documents are required"
        }), 400

    pairs = [
        [query, document]
        for document in documents
    ]

    scores = reranker_model.predict(pairs)

    results = [
        {
            "index": index,
            "score": float(score)
        }
        for index, score in enumerate(scores)
    ]

    return jsonify({
        "success": True,
        "results": results
    })


# =========================
# Home
# =========================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "KnowVault local embedding and reranking service is running"
    })


# =========================
# Start Server
# =========================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=8000,
        debug=False
    )
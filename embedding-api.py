
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import numpy as np

app = Flask(__name__)

# Load model Indo-Islamic BERT
print("📥 Loading model: ramadita/indo-islamic-sentence-bert...")
model = SentenceTransformer("ramadita/indo-islamic-sentence-bert")
print("✅ Model loaded successfully!")

@app.route('/embed', methods=['POST'])
def embed():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        # Generate embedding
        embedding = model.encode(text, convert_to_numpy=True)
        # Normalisasi
        embedding = embedding / np.linalg.norm(embedding)
        
        return jsonify({
            'embedding': embedding.tolist(),
            'text': text
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)

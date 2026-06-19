# scripts/embed_quran_resume.py
import psycopg2
from sentence_transformers import SentenceTransformer
import numpy as np
from tqdm import tqdm
import time
import os

os.environ["TOKENIZERS_PARALLELISM"] = "false"

DATABASE_URL = "postgresql://neondb_owner:npg_e9NYUfAwI2Jb@ep-purple-waterfall-ao5g02js-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

print("🚀 RESUME EMBEDDING QURAN (dari yang gagal)")
print("📥 Loading Indo-Islamic BERT...")
model = SentenceTransformer("ramadita/indo-islamic-sentence-bert", device="cpu")
print("✅ Model loaded!\n")

def get_embedding_batch(texts, model):
    embeddings = model.encode(texts, convert_to_numpy=True, batch_size=4, show_progress_bar=False)
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    embeddings = embeddings / norms
    return embeddings.tolist()

# Fungsi untuk reconnect
def get_connection():
    return psycopg2.connect(DATABASE_URL)

BATCH_SIZE = 4  # Lebih kecil! 

print("📖 Processing QURAN (resume)...")
conn = get_connection()
cur = conn.cursor()

# Cek progress
cur.execute("SELECT COUNT(*) FROM quran_verses WHERE embedding IS NOT NULL")
done = cur.fetchone()[0]
print(f"✅ Already embedded: {done}/6236")

# Ambil yang belum
cur.execute("SELECT id, translation FROM quran_verses WHERE embedding IS NULL")
rows = cur.fetchall()
total = len(rows)
print(f"📊 Remaining to embed: {total}")

if total == 0:
    print("🎉 SEMUA SUDAH SELESAI!")
    cur.close()
    conn.close()
    exit()

start_time = time.time()
success = 0

for i in tqdm(range(0, total, BATCH_SIZE), desc="Quran"):
    try:
        batch = rows[i:i+BATCH_SIZE]
        ids = [r[0] for r in batch]
        texts = [r[1] or "" for r in batch]
        
        embeddings = get_embedding_batch(texts, model)
        
        for idx, embedding in zip(ids, embeddings):
            cur.execute("UPDATE quran_verses SET embedding = %s::vector WHERE id = %s", (embedding, idx))
        conn.commit()
        success += len(batch)
        
    except Exception as e:
        print(f"\n⚠️ Error at batch {i}: {e}")
        print("🔄 Reconnecting...")
        cur.close()
        conn.close()
        
        # Reconnect
        conn = get_connection()
        cur = conn.cursor()
        
        # Cek progress terakhir
        cur.execute("SELECT COUNT(*) FROM quran_verses WHERE embedding IS NOT NULL")
        done_now = cur.fetchone()[0]
        print(f"✅ Progress: {done_now}/6236")
        
        # Ambil ulang data yang belum
        cur.execute("SELECT id, translation FROM quran_verses WHERE embedding IS NULL")
        rows = cur.fetchall()
        total = len(rows)
        print(f"📊 Remaining: {total}")
        
        # Update i ke posisi yang benar
        # Lanjutkan dari batch terakhir
        continue

elapsed = time.time() - start_time
print(f"\n✅ QURAN SELESAI! ({elapsed/60:.1f} menit)")
print(f"📊 Berhasil: {success} verses")

# Verifikasi final
cur.execute("SELECT COUNT(*) FROM quran_verses WHERE embedding IS NOT NULL")
done = cur.fetchone()[0]
print(f"✅ Total Quran embedded: {done}/6236")

cur.close()
conn.close()
print("\n🎉 TAHAP 1 SELESAI!")
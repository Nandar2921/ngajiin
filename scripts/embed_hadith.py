# scripts/embed_hadith_indoislamic_safe.py
import psycopg2
from sentence_transformers import SentenceTransformer
import numpy as np
import time
import os

os.environ["TOKENIZERS_PARALLELISM"] = "false"

DATABASE_URL = "postgresql://neondb_owner:npg_e9NYUfAwI2Jb@ep-purple-waterfall-ao5g02js-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

print("🚀 EMBEDDING HADITH - INDO-ISLAMIC BERT (2048 DIMS)")
print("⚠️  Mode ULTRA SAFE: 5 hadith per run, jeda 10 detik")
print("📥 Loading Indo-Islamic BERT...")
model = SentenceTransformer("ramadita/indo-islamic-sentence-bert", device="cpu")
print("✅ Model loaded!\n")

def get_embedding(text, model):
    if not text or text.strip() == "":
        return None
    embedding = model.encode(text, convert_to_numpy=True)
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    return embedding.tolist()

def get_connection():
    return psycopg2.connect(DATABASE_URL)

# ====== MAIN ======
print("\n📋 PILIH:")
print("1. Embed 5 hadith (test)")
print("2. Embed 10 hadith")
print("3. Embed 20 hadith")
print("4. Embed 2000 hadith")
print("5. Cek Progress")

choice = input("\nPilih nomor: ")

if choice == "5":
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT 
            b.name,
            COUNT(h.id) as total,
            COUNT(h.embedding) as embedded
        FROM hadith_books b
        LEFT JOIN hadiths h ON h.book_id = b.id
        WHERE b.id IN (1, 2)
        GROUP BY b.id, b.name
    """)
    print("\n📊 PROGRESS:")
    for row in cur.fetchall():
        pct = row[2]/row[1]*100 if row[1] > 0 else 0
        print(f"   {row[0]}: {row[2]}/{row[1]} ({pct:.1f}%)")
    cur.close()
    conn.close()
    exit()

limits = {
    "1": 5,
    "2": 10,
    "3": 20,
    "4": 2000
}

if choice not in limits:
    print("❌ Pilihan tidak valid!")
    exit()

limit = limits[choice]

# Pilih book
print("\n📖 Pilih kitab:")
print("1. Bukhari")
print("2. Muslim")
book_choice = input("Pilih: ")

book_id = 1 if book_choice == "1" else 2
book_name = "Bukhari" if book_choice == "1" else "Muslim"

print(f"\n🔥 Embedding {limit} hadith dari {book_name} (2048 dims)...")
print("⚠️  Jeda 10 detik antar hadith biar CPU ga panas!")

conn = get_connection()
cur = conn.cursor()

# Ambil yang belum di-embed
cur.execute("""
    SELECT id, translation FROM hadiths 
    WHERE book_id = %s AND embedding IS NULL
    ORDER BY id
    LIMIT %s
""", (book_id, limit))

rows = cur.fetchall()
total = len(rows)

if total == 0:
    print("✅ SEMUA SUDAH SELESAI!")
    cur.close()
    conn.close()
    exit()

print(f"📊 Akan memproses {total} hadith")

start_time = time.time()
success = 0

for i, (id, text) in enumerate(rows):
    try:
        print(f"   [{i+1}/{total}] Processing hadith {id}...")
        embedding = get_embedding(text, model)
        if embedding:
            cur.execute("UPDATE hadiths SET embedding = %s::vector WHERE id = %s", (embedding, id))
            conn.commit()
            success += 1
            print(f"   ✅ Hadith {id} selesai!")
            
        # JEDA 5 DETIK SETIAP HADITH!
        if i < total - 1:
            print("   ⏸️ Jeda 5 detik (biar CPU dingin)...")
            time.sleep(5)
            
    except Exception as e:
        print(f"   ⚠️ Error: {e}")
        print("   🔄 Reconnecting...")
        cur.close()
        conn.close()
        time.sleep(15)
        conn = get_connection()
        cur = conn.cursor()
        continue

elapsed = time.time() - start_time

# Cek progress
cur.execute("SELECT COUNT(*) FROM hadiths WHERE book_id = %s AND embedding IS NOT NULL", (book_id,))
done = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM hadiths WHERE book_id = %s", (book_id,))
total_book = cur.fetchone()[0]

print(f"\n✅ SELESAI! {success} hadith di-embed")
print(f"⏱️ Waktu: {elapsed/60:.1f} menit")
print(f"📊 Progress {book_name}: {done}/{total_book} ({done/total_book*100:.1f}%)")

cur.close()
conn.close()

print("\n💡 Tips:")
print("   - Pilih 5 dulu buat test")
print("   - Kalau kuat, naikkan ke 10 atau 20")
print("   - Jeda 5 detik biar CPU ga overheat")
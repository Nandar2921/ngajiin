import psycopg2
import requests
import time

# Koneksi database
conn = psycopg2.connect(
    host="localhost",
    port=5433,
    user="postgres",
    password="sikaji29",
    database="sikaji"
)
cur = conn.cursor()

# API endpoint embedding
EMBED_BATCH_API = "http://localhost:8000/embed/batch"

def get_embeddings_batch(texts, batch_size=20):
    """Kirim batch teks ke API embedding"""
    all_embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        try:
            response = requests.post(
                EMBED_BATCH_API, 
                json={"texts": batch}, 
                timeout=120
            )
            if response.status_code == 200:
                embeddings = response.json()["embeddings"]
                all_embeddings.extend(embeddings)
                print(f"      Batch {i//batch_size + 1} selesai")
            else:
                print(f"      Batch gagal: {response.status_code}")
                return None
        except Exception as e:
            print(f"      Request failed: {e}")
            return None
    
    return all_embeddings

def generate_embeddings(table_name, text_column, id_column, batch_size=20):
    print(f"\n📖 Memproses {table_name}...")
    
    # Ambil data yang belum ada embedding
    cur.execute(f"""
        SELECT {id_column}, {text_column} 
        FROM {table_name} 
        WHERE embedding IS NULL AND {text_column} IS NOT NULL
    """)
    
    rows = cur.fetchall()
    if not rows:
        print(f"   ✅ Semua data {table_name} sudah memiliki embedding")
        return 0
    
    print(f"   Menemukan {len(rows)} data perlu embedding")
    
    total = 0
    # Proses dalam batch besar
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        ids = [row[0] for row in batch]
        texts = [row[1][:512] for row in batch]  # Potong jika terlalu panjang
        
        print(f"   Memproses batch {i//batch_size + 1}...")
        
        # Dapatkan embedding batch
        embeddings = get_embeddings_batch(texts)
        
        if embeddings:
            for row_id, embedding in zip(ids, embeddings):
                vector_str = f"[{','.join(map(str, embedding))}]"
                cur.execute(f"""
                    UPDATE {table_name} 
                    SET embedding = %s::vector 
                    WHERE {id_column} = %s
                """, (vector_str, row_id))
                total += 1
            
            conn.commit()
            print(f"   ✅ {total} data terproses")
        else:
            print(f"   ⚠️ Batch gagal, coba lagi nanti...")
            time.sleep(3)
            continue
    
    print(f"   ✅ Selesai: {total} embedding untuk {table_name}")
    return total

# Cek koneksi ke API
print("🔍 Cek koneksi ke API embedding...")
try:
    response = requests.get("http://localhost:8000/health", timeout=5)
    if response.status_code == 200:
        print("✅ API embedding berjalan!")
    else:
        print("❌ API bermasalah")
        exit(1)
except:
    print("❌ API embedding tidak berjalan! Jalankan 'python embedding-api.py' dulu")
    exit(1)

print("🚀 Mulai generate embedding dengan IndoBERT (batch mode)...\n")

# Generate embeddings
total_quran = generate_embeddings("quran_verses", "translation", "id")
total_hadith = generate_embeddings("hadiths", "translation", "id")
total_tafsir = generate_embeddings("tafsir", "content", "id")

print(f"\n🎉 SELESAI!")
print(f"   📖 Quran: {total_quran} embedding baru")
print(f"   📜 Hadits: {total_hadith} embedding baru")
print(f"   📚 Tafsir: {total_tafsir} embedding baru")

cur.close()
conn.close()
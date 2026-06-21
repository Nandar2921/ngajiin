import os
import psycopg2

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise SystemExit("DATABASE_URL belum di-set. Jalankan: set DATABASE_URL=... (Windows) atau export DATABASE_URL=... (Mac/Linux) sebelum menjalankan script ini.")

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Hapus kolom lama dan buat baru dengan 2048 dimensi
tables = ['quran_verses', 'hadiths', 'tafsir']
for table in tables:
    try:
        cur.execute(f"ALTER TABLE {table} DROP COLUMN IF EXISTS embedding")
        cur.execute(f"ALTER TABLE {table} ADD COLUMN embedding vector(2048)")
        print(f"✅ {table} updated to 2048 dimensions")
    except Exception as e:
        print(f"❌ Error on {table}: {e}")

conn.commit()
cur.close()
conn.close()
print("\n🎉 Kolom embedding siap untuk 2048 dimensi!")
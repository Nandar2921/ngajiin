import psycopg2

DATABASE_URL = "postgresql://neondb_owner:npg_e9NYUfAwI2Jb@ep-purple-waterfall-ao5g02js-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

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
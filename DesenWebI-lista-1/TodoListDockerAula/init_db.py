import sqlite3

con = sqlite3.connect("data\database.db")
cur = con.cursor()
cur.execute("""
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed INTEGER DEFAULT 0
)
""")
con.commit()
con.close()
print("Banco de dados criado com sucesso!")
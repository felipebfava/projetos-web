from flask import Flask, render_template, request, redirect
import socket
import os
import logging
import sqlite3

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.before_request
def log_request_info():
    hostname = socket.gethostname()
    port = os.environ.get('PORT', '5000')  # Pega a porta do ambiente ou usa 5000 como padrão
    logger.info(f"Requisição recebida em {hostname} na porta {port}")

def connect_db():
    # return sqlite3.connect("database.db")
    db_path = '/app/db/database.db'
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/env')
def env():
    return str(os.environ)

@app.route('/oi')
def hello():
    hostname = socket.gethostname()
    port = os.environ.get('PORT', '5000')  # Pega a porta do ambiente ou usa 5000 como padrão
    logger.info(f"Requisição recebida em {hostname} na porta {port}")
    return f"Hello from {hostname} on port {port}!\n"

@app.route('/')
def index():
    con = connect_db()
    cur = con.cursor()
    cur.execute("SELECT * FROM tasks")
    tasks = cur.fetchall()
    con.close()
    return render_template("index.html", tasks=tasks)

@app.route('/add', methods=['POST'])
def add_task():
    task = request.form['task']
    con = connect_db()
    cur = con.cursor()
    cur.execute("INSERT INTO tasks (task, completed) VALUES (?, ?)", (task, 0))
    con.commit()
    con.close()
    return redirect('/')

@app.route('/delete/<int:id>')
def delete_task(id):
    con = connect_db()
    cur = con.cursor()
    cur.execute("DELETE FROM tasks WHERE id=?", (id,))
    con.commit()
    con.close()
    return redirect('/')

@app.route('/complete/<int:id>')
def complete_task(id):
    con = connect_db()
    cur = con.cursor()
    cur.execute("UPDATE tasks SET completed = 1 WHERE id=?", (id,))
    con.commit()
    con.close()
    return redirect('/')

if __name__ == "__main__":
    app.run(debug=True)
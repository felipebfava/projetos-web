// database/db.js
import sqlite3 from 'sqlite3';
sqlite3.verbose();

// Criar conexão com o banco
const db = new sqlite3.Database('./db.sqlite3', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Promisificação segura
const dbAsync = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// Inicialização assíncrona
const initDb = async () => {
  try {
    await dbAsync.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    )`);

    const count = await dbAsync.get('SELECT COUNT(*) as count FROM usuarios');
    if (count.count === 0) {
      const usuarios = [
        { nome: 'Felipe', email: 'felipe@gmail.com' },
        { nome: 'Ana', email: 'ana@gmail.com' },
        { nome: 'Carlos', email: 'carlos@gmail.com' },
        { nome: 'Mariana', email: 'mariana@gmail.com' },
        { nome: 'João', email: 'joao@gmail.com' },
        { nome: 'Beatriz', email: 'beatriz@gmail.com' },
        { nome: 'Pedro', email: 'pedro@gmail.com' },
        { nome: 'Luiza', email: 'luiza@gmail.com' },
        { nome: 'Gabriel', email: 'gabriel@gmail.com' },
        { nome: 'Julia', email: 'julia@gmail.com' }
      ];

      for (const usuario of usuarios) {
        await dbAsync.run(
          'INSERT INTO usuarios (nome, email) VALUES (?, ?)',
          [usuario.nome, usuario.email]
        );
      }

      console.log('Usuários iniciais inseridos com sucesso!');
    }
  } catch (error) {
    console.error('Erro na inicialização do banco:', error.message);
  }
};

// Executar a inicialização uma vez
await initDb();

// Exportar o objeto dbAsync para ser usado na API
export default dbAsync;

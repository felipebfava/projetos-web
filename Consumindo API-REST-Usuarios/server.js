// server.js
import express from 'express';
import usuariosRoutes from './routes/usuarios.js';

// Importar o banco de dados para garantir que ele inicializa
import './database/db.js';

const app = express();
const PORT = 3000;

// Middleware para JSON
app.use(express.json());

// Middleware para logging de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware para os cabeçalhos CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Rotas
app.use('/usuarios', usuariosRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API de Usuários RESTful',
    versao: '1.0.0',
    links: [
      { rel: 'usuarios', method: 'GET', href: '/usuarios' }
    ]
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err.stack);
  res.status(500).json({ 
    erro: 'Ocorreu um erro interno',
    mensagem: process.env.NODE_ENV === 'development' ? err.message : 'Entre em contato com o administrador'
  });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ 
    erro: 'Rota não encontrada',
    links: [
      { rel: 'home', method: 'GET', href: '/' }
    ]
  });
});

// Tratamento de exceções não capturadas
process.on('uncaughtException', (error) => {
  console.error('Exceção não capturada:', error);
  // Em um ambiente de produção, seria interessante notificar um sistema de monitoramento aqui
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição não tratada:', reason);
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
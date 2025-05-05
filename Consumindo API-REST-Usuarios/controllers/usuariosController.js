// controllers/usuariosController.js
import db from '../database/db.js';

export async function listarUsuarios(req, res) {
  try {
    const { 
      limit = 5,  
      page = 1,   
      nome, 
      ordem = 'asc' 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    // Construir a consulta de contagem
    let countQuery = 'SELECT COUNT(*) as total FROM usuarios';
    const countParams = [];
    
    if (nome) {
      countQuery += ' WHERE nome LIKE ?';
      countParams.push(`%${nome}%`);
    }
    
    // Executar a consulta de contagem
    const countResult = await db.get(countQuery, countParams);
    const total = countResult ? countResult.total : 0;
    
    // Construir a consulta principal
    let query = 'SELECT * FROM usuarios';
    const params = [];

    if (nome) {
      query += ' WHERE nome LIKE ?';
      params.push(`%${nome}%`);
    }

    query += ` ORDER BY id ${ordem.toUpperCase()} LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    // Executar a consulta principal
    const usuarios = await db.all(query, params);
    
    // Adiciona links HATEOAS para cada usuário
    const usuariosComLinks = usuarios.map(usuario => ({
      ...usuario,
      links: [
        { rel: 'self', method: 'GET', href: `/usuarios/${usuario.id}` },
        { rel: 'update', method: 'PUT', href: `/usuarios/${usuario.id}` },
        { rel: 'patch', method: 'PATCH', href: `/usuarios/${usuario.id}` },
        { rel: 'delete', method: 'DELETE', href: `/usuarios/${usuario.id}` }
      ]
    }));
    
    // Calcula informações para paginação
    const totalPages = Math.ceil(total / Number(limit));
    const currentPage = Number(page);
    
    // Resposta final com metadados de paginação e HATEOAS
    res.json({
      data: usuariosComLinks,
      meta: {
        total,
        limit: Number(limit),
        page: currentPage,
        totalPages,
      },
      links: {
        self: `/usuarios?page=${currentPage}&limit=${limit}`,
        first: `/usuarios?page=1&limit=${limit}`,
        last: `/usuarios?page=${totalPages}&limit=${limit}`,
        prev: currentPage > 1 ? `/usuarios?page=${currentPage - 1}&limit=${limit}` : null,
        next: currentPage < totalPages ? `/usuarios?page=${currentPage + 1}&limit=${limit}` : null,
      }
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ erro: 'Erro ao buscar usuários', detalhes: error.message });
  }
}

export async function listarUsuarioPorId(req, res) {
  try {
    const { id } = req.params;
    const usuario = await db.get('SELECT * FROM usuarios WHERE id = ?', [id]);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Adiciona links HATEOAS
    const usuarioComLinks = {
      ...usuario,
      links: [
        { rel: 'self', method: 'GET', href: `/usuarios/${usuario.id}` },
        { rel: 'update', method: 'PUT', href: `/usuarios/${usuario.id}` },
        { rel: 'patch', method: 'PATCH', href: `/usuarios/${usuario.id}` },
        { rel: 'delete', method: 'DELETE', href: `/usuarios/${usuario.id}` },
        { rel: 'collection', method: 'GET', href: '/usuarios' }
      ]
    };

    res.json(usuarioComLinks);
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    res.status(500).json({ erro: 'Erro ao buscar usuário', detalhes: error.message });
  }
}

export async function criarUsuario(req, res) {
  try {
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
    }

    // Verificar se email já existe
    const usuarioExistente = await db.get('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    const result = await db.run(
      'INSERT INTO usuarios (nome, email) VALUES (?, ?)',
      [nome, email]
    );

    const novoUsuario = {
      id: result.lastID,
      nome,
      email,
      links: [
        { rel: 'self', method: 'GET', href: `/usuarios/${result.lastID}` },
        { rel: 'update', method: 'PUT', href: `/usuarios/${result.lastID}` },
        { rel: 'patch', method: 'PATCH', href: `/usuarios/${result.lastID}` },
        { rel: 'delete', method: 'DELETE', href: `/usuarios/${result.lastID}` },
        { rel: 'collection', method: 'GET', href: '/usuarios' }
      ]
    };

    res.status(201).json(novoUsuario);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ erro: 'Erro ao criar usuário', detalhes: error.message });
  }
}

export async function atualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
    }

    const usuario = await db.get('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Verificar se o novo email já pertence a outro usuário
    if (email !== usuario.email) {
      const emailExistente = await db.get('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, id]);
      if (emailExistente) {
        return res.status(409).json({ erro: 'Email já está sendo usado por outro usuário' });
      }
    }

    await db.run(
      'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
      [nome, email, id]
    );

    const usuarioAtualizado = {
      id: Number(id),
      nome,
      email,
      links: [
        { rel: 'self', method: 'GET', href: `/usuarios/${id}` },
        { rel: 'update', method: 'PUT', href: `/usuarios/${id}` },
        { rel: 'patch', method: 'PATCH', href: `/usuarios/${id}` },
        { rel: 'delete', method: 'DELETE', href: `/usuarios/${id}` },
        { rel: 'collection', method: 'GET', href: '/usuarios' }
      ]
    };

    res.json(usuarioAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ erro: 'Erro ao atualizar usuário', detalhes: error.message });
  }
}

export async function atualizarParcialUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nome, email } = req.body;

    if (!nome && !email) {
      return res.status(400).json({ erro: 'Forneça pelo menos um campo para atualizar (nome ou email)' });
    }

    const usuario = await db.get('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const novoNome = nome !== undefined ? nome : usuario.nome;
    const novoEmail = email !== undefined ? email : usuario.email;

    // Verificar se o novo email já pertence a outro usuário
    if (novoEmail !== usuario.email) {
      const emailExistente = await db.get('SELECT id FROM usuarios WHERE email = ? AND id != ?', [novoEmail, id]);
      if (emailExistente) {
        return res.status(409).json({ erro: 'Email já está sendo usado por outro usuário' });
      }
    }

    await db.run(
      'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
      [novoNome, novoEmail, id]
    );

    const usuarioAtualizado = {
      id: Number(id),
      nome: novoNome,
      email: novoEmail,
      links: [
        { rel: 'self', method: 'GET', href: `/usuarios/${id}` },
        { rel: 'update', method: 'PUT', href: `/usuarios/${id}` },
        { rel: 'patch', method: 'PATCH', href: `/usuarios/${id}` },
        { rel: 'delete', method: 'DELETE', href: `/usuarios/${id}` },
        { rel: 'collection', method: 'GET', href: '/usuarios' }
      ]
    };

    res.json(usuarioAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar parcialmente usuário:', error);
    res.status(500).json({ erro: 'Erro ao atualizar parcialmente usuário', detalhes: error.message });
  }
}

export async function deletarUsuario(req, res) {
  try {
    const { id } = req.params;
    const usuario = await db.get('SELECT * FROM usuarios WHERE id = ?', [id]);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    await db.run('DELETE FROM usuarios WHERE id = ?', [id]);
    
    res.status(200).json({ 
      mensagem: 'Usuário deletado com sucesso',
      links: [
        { rel: 'collection', method: 'GET', href: '/usuarios' }
      ]
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ erro: 'Erro ao deletar usuário', detalhes: error.message });
  }
}
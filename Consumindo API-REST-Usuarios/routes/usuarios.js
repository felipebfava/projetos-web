// routes/usuarios.js
import express from 'express';
import * as controller from '../controllers/usuariosController.js';

const router = express.Router();

router.get('/', controller.listarUsuarios);
router.get('/:id', controller.listarUsuarioPorId);
router.post('/', controller.criarUsuario);
router.put('/:id', controller.atualizarUsuario);
router.patch('/:id', controller.atualizarParcialUsuario);
router.delete('/:id', controller.deletarUsuario);

export default router;
const express = require('express');
const router = express.Router();
const EventoFavoritoController = require('../controllers/EventoFavoritoController');
const { authenticate, authorize } = require('../middlewares/auth');

// Rutas para favoritos del visitante
router.get('/favoritos', authenticate, authorize(['visitante', 'admin', 'manager']), EventoFavoritoController.obtenerFavoritos);
router.post('/eventos/:id_evento/favorito', authenticate, authorize(['visitante', 'admin', 'manager']), EventoFavoritoController.agregarFavorito);
router.delete('/eventos/:id_evento/favorito', authenticate, authorize(['visitante', 'admin', 'manager']), EventoFavoritoController.eliminarFavorito);
router.put('/eventos/:id_evento/favorito', authenticate, authorize(['visitante', 'admin', 'manager']), EventoFavoritoController.actualizarFavorito);
router.get('/favoritos/estadisticas', authenticate, authorize(['visitante', 'admin', 'manager']), EventoFavoritoController.obtenerEstadisticas);

module.exports = router; 
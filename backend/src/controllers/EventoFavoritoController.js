const db = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const { Op } = require('sequelize');

const EventoFavorito = db.EventoFavorito;
const Evento = db.Evento;
const Usuario = db.Usuario;

class EventoFavoritoController {
  /**
   * Obtener todos los favoritos del usuario
   */
  static async obtenerFavoritos(req, res) {
    try {
      const { id_usuario } = req.user;
      
      const favoritos = await EventoFavorito.findAll({
        where: {
          id_usuario,
          deleted_at: null
        },
        include: [
          {
            model: Evento,
            as: 'evento',
            attributes: ['id_evento', 'nombre_evento', 'descripcion', 'fecha_inicio', 'fecha_fin', 'ubicacion', 'imagen_logo', 'estado']
          }
        ],
        order: [['fecha_agregado', 'DESC']]
      });

      return ApiResponse.success(res, favoritos, 'Favoritos obtenidos correctamente');
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      return ApiResponse.error(res, 'Error al obtener los favoritos');
    }
  }

  /**
   * Agregar evento a favoritos
   */
  static async agregarFavorito(req, res) {
    try {
      const { id_usuario } = req.user;
      const { id_evento } = req.params;
      const { prioridad = 'media', recordatorio = false, fecha_recordatorio = null, notas_personales = null } = req.body;

      // Verificar que el evento existe
      const evento = await Evento.findByPk(id_evento);
      if (!evento) {
        return ApiResponse.notFound(res, 'Evento no encontrado');
      }

      // Verificar si ya está en favoritos
      const favoritoExistente = await EventoFavorito.findOne({
        where: {
          id_usuario,
          id_evento,
          deleted_at: null
        }
      });

      if (favoritoExistente) {
        return ApiResponse.conflict(res, 'El evento ya está en tus favoritos');
      }

      // Crear nuevo favorito
      const nuevoFavorito = await EventoFavorito.create({
        id_usuario,
        id_evento,
        prioridad,
        recordatorio,
        fecha_recordatorio,
        notas_personales,
        created_by: id_usuario
      });

      // Obtener el favorito con la información del evento
      const favoritoCompleto = await EventoFavorito.findByPk(nuevoFavorito.id_evento_favorito, {
        include: [
          {
            model: Evento,
            as: 'evento',
            attributes: ['id_evento', 'nombre_evento', 'descripcion', 'fecha_inicio', 'fecha_fin', 'ubicacion', 'imagen_logo', 'estado']
          }
        ]
      });

      return ApiResponse.success(res, favoritoCompleto, 'Evento agregado a favoritos correctamente');
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      return ApiResponse.error(res, 'Error al agregar el evento a favoritos');
    }
  }

  /**
   * Eliminar evento de favoritos
   */
  static async eliminarFavorito(req, res) {
    try {
      const { id_usuario } = req.user;
      const { id_evento } = req.params;

      const favorito = await EventoFavorito.findOne({
        where: {
          id_usuario,
          id_evento,
          deleted_at: null
        }
      });

      if (!favorito) {
        return ApiResponse.notFound(res, 'Favorito no encontrado');
      }

      // Soft delete
      await favorito.update({
        deleted_at: new Date(),
        deleted_by: id_usuario
      });

      return ApiResponse.success(res, null, 'Evento eliminado de favoritos correctamente');
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      return ApiResponse.error(res, 'Error al eliminar el evento de favoritos');
    }
  }

  /**
   * Actualizar favorito
   */
  static async actualizarFavorito(req, res) {
    try {
      const { id_usuario } = req.user;
      const { id_evento } = req.params;
      const { prioridad, recordatorio, fecha_recordatorio, notas_personales } = req.body;

      const favorito = await EventoFavorito.findOne({
        where: {
          id_usuario,
          id_evento,
          deleted_at: null
        }
      });

      if (!favorito) {
        return ApiResponse.notFound(res, 'Favorito no encontrado');
      }

      // Actualizar campos
      const camposActualizar = {};
      if (prioridad !== undefined) camposActualizar.prioridad = prioridad;
      if (recordatorio !== undefined) camposActualizar.recordatorio = recordatorio;
      if (fecha_recordatorio !== undefined) camposActualizar.fecha_recordatorio = fecha_recordatorio;
      if (notas_personales !== undefined) camposActualizar.notas_personales = notas_personales;

      await favorito.update({
        ...camposActualizar,
        updated_by: id_usuario
      });

      // Obtener el favorito actualizado con la información del evento
      const favoritoActualizado = await EventoFavorito.findByPk(favorito.id_evento_favorito, {
        include: [
          {
            model: Evento,
            as: 'evento',
            attributes: ['id_evento', 'nombre_evento', 'descripcion', 'fecha_inicio', 'fecha_fin', 'ubicacion', 'imagen_logo', 'estado']
          }
        ]
      });

      return ApiResponse.success(res, favoritoActualizado, 'Favorito actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      return ApiResponse.error(res, 'Error al actualizar el favorito');
    }
  }

  /**
   * Obtener estadísticas de favoritos
   */
  static async obtenerEstadisticas(req, res) {
    try {
      const { id_usuario } = req.user;

      const [
        totalFavoritos,
        conRecordatorio,
        recientes7Dias,
        altaPrioridad
      ] = await Promise.all([
        EventoFavorito.count({
          where: {
            id_usuario,
            deleted_at: null
          }
        }),
        EventoFavorito.count({
          where: {
            id_usuario,
            recordatorio: true,
            deleted_at: null
          }
        }),
        EventoFavorito.count({
          where: {
            id_usuario,
            fecha_agregado: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            },
            deleted_at: null
          }
        }),
        EventoFavorito.count({
          where: {
            id_usuario,
            prioridad: 'alta',
            deleted_at: null
          }
        })
      ]);

      const estadisticas = {
        totalFavoritos,
        conRecordatorio,
        recientes7Dias,
        altaPrioridad
      };

      return ApiResponse.success(res, estadisticas, 'Estadísticas obtenidas correctamente');
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return ApiResponse.error(res, 'Error al obtener las estadísticas');
    }
  }
}

module.exports = EventoFavoritoController; 
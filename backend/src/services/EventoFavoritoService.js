const { EventoFavorito, Evento, TipoEvento, Usuario } = require('../models');
const { Op } = require('sequelize');
const AuditService = require('./AuditService');

/**
 * Servicio de EventoFavorito - Lógica de negocio
 */
class EventoFavoritoService {
  
  /**
   * Agregar evento a favoritos
   */
  static async agregarFavorito(userId, eventoId, datosAdicionales = {}) {
    try {
      // Verificar que el evento existe
      const evento = await Evento.findByPk(eventoId);
      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      // Verificar que no esté ya en favoritos
      const favoritoExistente = await EventoFavorito.findOne({
        where: {
          id_usuario: userId,
          id_evento: eventoId,
          deleted_at: null
        }
      });

      if (favoritoExistente) {
        throw new Error('El evento ya está en favoritos');
      }

      const dataToCreate = {
        id_usuario: userId,
        id_evento: eventoId,
        fecha_agregado: new Date(),
        notas_personales: datosAdicionales.notas_personales || null,
        prioridad: datosAdicionales.prioridad || 'media',
        recordatorio: datosAdicionales.recordatorio || false,
        fecha_recordatorio: datosAdicionales.fecha_recordatorio || null
      };

      const favorito = await AuditService.createWithAudit(EventoFavorito, dataToCreate, userId);
      
      return await this.getFavoritoById(favorito.id_evento_favorito);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener favoritos de un usuario
   */
  static async getFavoritosUsuario(userId, page = 1, limit = 10, filtros = {}) {
    try {
      const offset = (page - 1) * limit;
      const whereCondition = {
        id_usuario: userId,
        deleted_at: null
      };

      // Aplicar filtros
      if (filtros.prioridad) {
        whereCondition.prioridad = filtros.prioridad;
      }

      if (filtros.conRecordatorio) {
        whereCondition.recordatorio = true;
      }

      const options = {
        where: whereCondition,
        include: [{
          model: Evento,
          as: 'evento',
          include: [{
            model: TipoEvento,
            as: 'tipoEvento',
            attributes: ['id_tipo_evento', 'nombre_tipo', 'descripcion']
          }]
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha_agregado', 'DESC']],
        distinct: true
      };

      const { count, rows } = await EventoFavorito.findAndCountAll(options);

      return {
        favoritos: rows,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener favorito por ID
   */
  static async getFavoritoById(favoritoId) {
    try {
      const favorito = await AuditService.findByPkWithAudit(EventoFavorito, favoritoId, {
        include: [{
          model: Evento,
          as: 'evento',
          include: [{
            model: TipoEvento,
            as: 'tipoEvento',
            attributes: ['id_tipo_evento', 'nombre_tipo', 'descripcion']
          }]
        }]
      });

      if (!favorito) {
        throw new Error('Favorito no encontrado');
      }

      return favorito;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si un evento está en favoritos
   */
  static async esFavorito(userId, eventoId) {
    try {
      const favorito = await EventoFavorito.findOne({
        where: {
          id_usuario: userId,
          id_evento: eventoId,
          deleted_at: null
        }
      });

      return !!favorito;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar favorito
   */
  static async actualizarFavorito(favoritoId, userId, datosActualizacion) {
    try {
      const favorito = await AuditService.findByPkWithAudit(EventoFavorito, favoritoId);
      
      if (!favorito) {
        throw new Error('Favorito no encontrado');
      }

      // Verificar que pertenece al usuario
      if (favorito.id_usuario !== userId) {
        throw new Error('No tienes permisos para modificar este favorito');
      }

      // Filtrar solo los campos permitidos
      const camposPermitidos = [
        'notas_personales', 'prioridad', 'recordatorio', 'fecha_recordatorio'
      ];
      const updateClean = {};
      for (const campo of camposPermitidos) {
        if (datosActualizacion[campo] !== undefined) {
          updateClean[campo] = datosActualizacion[campo];
        }
      }

      const favoritoActualizado = await AuditService.updateWithAudit(
        EventoFavorito, 
        favoritoId, 
        updateClean, 
        userId
      );

      return await this.getFavoritoById(favoritoId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar de favoritos
   */
  static async eliminarFavorito(favoritoId, userId) {
    try {
      const favorito = await AuditService.findByPkWithAudit(EventoFavorito, favoritoId);
      
      if (!favorito) {
        throw new Error('Favorito no encontrado');
      }

      // Verificar que pertenece al usuario
      if (favorito.id_usuario !== userId) {
        throw new Error('No tienes permisos para eliminar este favorito');
      }

      await AuditService.softDeleteWithAudit(EventoFavorito, favoritoId, userId);
      
      return { message: 'Favorito eliminado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar favorito por evento y usuario
   */
  static async eliminarFavoritoPorEvento(userId, eventoId) {
    try {
      const favorito = await EventoFavorito.findOne({
        where: {
          id_usuario: userId,
          id_evento: eventoId,
          deleted_at: null
        }
      });

      if (!favorito) {
        throw new Error('Favorito no encontrado');
      }

      await AuditService.softDeleteWithAudit(EventoFavorito, favorito.id_evento_favorito, userId);
      
      return { message: 'Favorito eliminado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de favoritos
   */
  static async getEstadisticasFavoritos(userId) {
    try {
      const totalFavoritos = await EventoFavorito.count({
        where: {
          id_usuario: userId,
          deleted_at: null
        }
      });

      const favoritosConRecordatorio = await EventoFavorito.count({
        where: {
          id_usuario: userId,
          recordatorio: true,
          deleted_at: null
        }
      });

      const favoritosPorPrioridad = await EventoFavorito.findAll({
        where: {
          id_usuario: userId,
          deleted_at: null
        },
        attributes: [
          'prioridad',
          [EventoFavorito.sequelize.fn('COUNT', '*'), 'cantidad']
        ],
        group: ['prioridad']
      });

      const favoritosRecientes = await EventoFavorito.count({
        where: {
          id_usuario: userId,
          fecha_agregado: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
          },
          deleted_at: null
        }
      });

      return {
        totalFavoritos,
        favoritosConRecordatorio,
        favoritosPorPrioridad: favoritosPorPrioridad.reduce((acc, item) => {
          acc[item.prioridad] = parseInt(item.dataValues.cantidad);
          return acc;
        }, {}),
        favoritosRecientes
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener favoritos con recordatorios próximos
   */
  static async getFavoritosConRecordatorios(userId) {
    try {
      const ahora = new Date();
      const en24Horas = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

      const favoritos = await EventoFavorito.findAll({
        where: {
          id_usuario: userId,
          recordatorio: true,
          fecha_recordatorio: {
            [Op.between]: [ahora, en24Horas]
          },
          deleted_at: null
        },
        include: [{
          model: Evento,
          as: 'evento',
          attributes: ['id_evento', 'nombre_evento', 'fecha_inicio', 'fecha_fin', 'ubicacion']
        }],
        order: [['fecha_recordatorio', 'ASC']]
      });

      return favoritos;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EventoFavoritoService; 
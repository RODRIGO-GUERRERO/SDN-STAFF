const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const EventoGuardado = sequelize.define('EventoGuardado', {
    id_evento_guardado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID del usuario es requerido'
        }
      }
    },
    id_evento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'evento',
        key: 'id_evento'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID del evento es requerido'
        }
      }
    },
    fecha_guardado: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    categoria_personal: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Categoría personal asignada por el usuario'
    },
    etiquetas_personales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Etiquetas personales del usuario'
    },
    notas_personales: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas personales del usuario sobre este evento'
    },
    estado_revision: {
      type: DataTypes.ENUM('pendiente', 'revisado', 'interesado', 'no_interesado'),
      defaultValue: 'pendiente',
      validate: {
        isIn: {
          args: [['pendiente', 'revisado', 'interesado', 'no_interesado']],
          msg: 'El estado debe ser: pendiente, revisado, interesado o no_interesado'
        }
      }
    },
    fecha_revision: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que el usuario revisó el evento'
    },
    recordatorio_revision: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si el usuario quiere recordatorio para revisar'
    },
    fecha_recordatorio_revision: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha para recordatorio de revisión'
    },
    // Campos de auditoría
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'evento_guardado',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        unique: true,
        fields: ['id_usuario', 'id_evento'],
        name: 'unique_usuario_evento_guardado'
      },
      {
        fields: ['id_usuario']
      },
      {
        fields: ['id_evento']
      },
      {
        fields: ['fecha_guardado']
      },
      {
        fields: ['categoria_personal']
      },
      {
        fields: ['estado_revision']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      },
      pendientes: {
        where: {
          estado_revision: 'pendiente',
          deleted_at: null
        }
      },
      revisados: {
        where: {
          estado_revision: 'revisado',
          deleted_at: null
        }
      },
      interesados: {
        where: {
          estado_revision: 'interesado',
          deleted_at: null
        }
      }
    }
  });

  // Métodos de instancia
  EventoGuardado.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  EventoGuardado.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  EventoGuardado.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  EventoGuardado.prototype.marcarRevisado = function() {
    return this.update({
      estado_revision: 'revisado',
      fecha_revision: new Date()
    });
  };

  EventoGuardado.prototype.marcarInteresado = function() {
    return this.update({
      estado_revision: 'interesado',
      fecha_revision: new Date()
    });
  };

  EventoGuardado.prototype.marcarNoInteresado = function() {
    return this.update({
      estado_revision: 'no_interesado',
      fecha_revision: new Date()
    });
  };

  EventoGuardado.prototype.activarRecordatorioRevision = function(fechaRecordatorio = null) {
    const fecha = fechaRecordatorio || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas por defecto
    return this.update({
      recordatorio_revision: true,
      fecha_recordatorio_revision: fecha
    });
  };

  EventoGuardado.prototype.desactivarRecordatorioRevision = function() {
    return this.update({
      recordatorio_revision: false,
      fecha_recordatorio_revision: null
    });
  };

  EventoGuardado.prototype.agregarEtiqueta = function(etiqueta) {
    const etiquetas = this.etiquetas_personales || [];
    if (!etiquetas.includes(etiqueta)) {
      etiquetas.push(etiqueta);
      return this.update({
        etiquetas_personales: etiquetas
      });
    }
    return Promise.resolve(this);
  };

  EventoGuardado.prototype.removerEtiqueta = function(etiqueta) {
    const etiquetas = this.etiquetas_personales || [];
    const etiquetasFiltradas = etiquetas.filter(e => e !== etiqueta);
    return this.update({
      etiquetas_personales: etiquetasFiltradas
    });
  };

  // Asociaciones
  EventoGuardado.associate = function(models) {
    // Relación con Usuario
    EventoGuardado.belongsTo(models.Usuario, {
      foreignKey: 'id_usuario',
      as: 'usuario'
    });

    // Relación con Evento
    EventoGuardado.belongsTo(models.Evento, {
      foreignKey: 'id_evento',
      as: 'evento'
    });

    // Asociaciones de auditoría
    EventoGuardado.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    EventoGuardado.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    EventoGuardado.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return EventoGuardado;
}; 
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const EmpresaFavorita = sequelize.define('EmpresaFavorita', {
    id_empresa_favorita: {
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
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa_expositora',
        key: 'id_empresa'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID de la empresa es requerido'
        }
      }
    },
    fecha_agregado: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    motivo_interes: {
      type: DataTypes.ENUM('productos', 'servicios', 'tecnologia', 'networking', 'inversion', 'colaboracion', 'otro'),
      allowNull: true,
      validate: {
        isIn: {
          args: [['productos', 'servicios', 'tecnologia', 'networking', 'inversion', 'colaboracion', 'otro']],
          msg: 'El motivo debe ser válido'
        }
      }
    },
    notas_personales: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas personales del usuario sobre esta empresa'
    },
    prioridad_contacto: {
      type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
      defaultValue: 'media',
      validate: {
        isIn: {
          args: [['baja', 'media', 'alta', 'urgente']],
          msg: 'La prioridad debe ser: baja, media, alta o urgente'
        }
      }
    },
    recordatorio_contacto: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si el usuario quiere recordatorio para contactar'
    },
    fecha_recordatorio_contacto: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha para recordatorio de contacto'
    },
    ultima_visita_perfil: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Última vez que el usuario visitó el perfil'
    },
    numero_visitas_perfil: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Número de veces que ha visitado el perfil'
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
    tableName: 'empresa_favorita',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        unique: true,
        fields: ['id_usuario', 'id_empresa'],
        name: 'unique_usuario_empresa_favorita'
      },
      {
        fields: ['id_usuario']
      },
      {
        fields: ['id_empresa']
      },
      {
        fields: ['fecha_agregado']
      },
      {
        fields: ['motivo_interes']
      },
      {
        fields: ['prioridad_contacto']
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
      conRecordatorio: {
        where: {
          recordatorio_contacto: true,
          deleted_at: null
        }
      },
      altaPrioridad: {
        where: {
          prioridad_contacto: ['alta', 'urgente'],
          deleted_at: null
        }
      }
    }
  });

  // Métodos de instancia
  EmpresaFavorita.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  EmpresaFavorita.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  EmpresaFavorita.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  EmpresaFavorita.prototype.activarRecordatorioContacto = function(fechaRecordatorio = null) {
    const fecha = fechaRecordatorio || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas por defecto
    return this.update({
      recordatorio_contacto: true,
      fecha_recordatorio_contacto: fecha
    });
  };

  EmpresaFavorita.prototype.desactivarRecordatorioContacto = function() {
    return this.update({
      recordatorio_contacto: false,
      fecha_recordatorio_contacto: null
    });
  };

  EmpresaFavorita.prototype.actualizarPrioridadContacto = function(nuevaPrioridad) {
    const prioridadesValidas = ['baja', 'media', 'alta', 'urgente'];
    if (!prioridadesValidas.includes(nuevaPrioridad)) {
      throw new Error('Prioridad inválida');
    }
    return this.update({
      prioridad_contacto: nuevaPrioridad
    });
  };

  EmpresaFavorita.prototype.registrarVisitaPerfil = function() {
    this.numero_visitas_perfil += 1;
    this.ultima_visita_perfil = new Date();
    return this.save();
  };

  EmpresaFavorita.prototype.actualizarMotivoInteres = function(nuevoMotivo) {
    const motivosValidos = ['productos', 'servicios', 'tecnologia', 'networking', 'inversion', 'colaboracion', 'otro'];
    if (!motivosValidos.includes(nuevoMotivo)) {
      throw new Error('Motivo inválido');
    }
    return this.update({
      motivo_interes: nuevoMotivo
    });
  };

  // Asociaciones
  EmpresaFavorita.associate = function(models) {
    // Relación con Usuario
    EmpresaFavorita.belongsTo(models.Usuario, {
      foreignKey: 'id_usuario',
      as: 'usuario'
    });

    // Relación con EmpresaExpositora
    EmpresaFavorita.belongsTo(models.EmpresaExpositora, {
      foreignKey: 'id_empresa',
      as: 'empresa'
    });

    // Asociaciones de auditoría
    EmpresaFavorita.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    EmpresaFavorita.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    EmpresaFavorita.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return EmpresaFavorita;
}; 
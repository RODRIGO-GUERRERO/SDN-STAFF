module.exports = (sequelize, DataTypes) => {
  const EventoFavorito = sequelize.define('EventoFavorito', {
  id_evento_favorito: {
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
    }
  },
  id_evento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'evento',
      key: 'id_evento'
    }
  },
  fecha_agregado: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  notas_personales: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prioridad: {
    type: DataTypes.ENUM('baja', 'media', 'alta'),
    allowNull: false,
    defaultValue: 'media'
  },
  recordatorio: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  fecha_recordatorio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuario',
      key: 'id_usuario'
    }
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuario',
      key: 'id_usuario'
    }
  },
  deleted_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuario',
      key: 'id_usuario'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'evento_favorito',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['id_usuario', 'id_evento']
    },
    {
      fields: ['id_usuario']
    },
    {
      fields: ['id_evento']
    },
    {
      fields: ['fecha_agregado']
    },
    {
      fields: ['prioridad']
    },
    {
      fields: ['recordatorio']
    }
  ]
});

  // Definir asociaciones
  EventoFavorito.associate = function(models) {
    EventoFavorito.belongsTo(models.Usuario, {
      foreignKey: 'id_usuario',
      as: 'usuario'
    });
    
    EventoFavorito.belongsTo(models.Evento, {
      foreignKey: 'id_evento',
      as: 'evento'
    });
    
    EventoFavorito.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'creador'
    });
    
    EventoFavorito.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'actualizador'
    });
    
    EventoFavorito.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'eliminador'
    });
  };

  return EventoFavorito;
}; 
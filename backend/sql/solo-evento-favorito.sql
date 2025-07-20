-- =====================================================
-- SCRIPT SQL SOLO PARA FUNCIONALIDAD DE FAVORITOS
-- SDN-STAFF - Sistema de Gestión de Eventos
-- =====================================================

-- Tabla: evento_favorito
CREATE TABLE IF NOT EXISTS `evento_favorito` (
  `id_evento_favorito` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_evento` int(11) NOT NULL,
  `fecha_agregado` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notas_personales` text DEFAULT NULL,
  `prioridad` enum('baja','media','alta') DEFAULT 'media',
  `recordatorio` tinyint(1) DEFAULT 0,
  `fecha_recordatorio` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_evento_favorito`),
  UNIQUE KEY `unique_usuario_evento_favorito` (`id_usuario`,`id_evento`),
  KEY `idx_evento_favorito_usuario` (`id_usuario`),
  KEY `idx_evento_favorito_evento` (`id_evento`),
  KEY `idx_evento_favorito_fecha_agregado` (`fecha_agregado`),
  CONSTRAINT `fk_evento_favorito_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_evento_favorito_evento` FOREIGN KEY (`id_evento`) REFERENCES `evento` (`id_evento`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Eventos favoritos de los visitantes';

-- Vista: Resumen de favoritos por usuario
CREATE OR REPLACE VIEW `v_favoritos_resumen` AS
SELECT 
    u.id_usuario,
    u.correo,
    COUNT(ef.id_evento_favorito) as total_favoritos,
    COUNT(CASE WHEN ef.recordatorio = 1 THEN 1 END) as con_recordatorio,
    COUNT(CASE WHEN ef.prioridad = 'alta' THEN 1 END) as alta_prioridad,
    COUNT(CASE WHEN ef.prioridad = 'media' THEN 1 END) as media_prioridad,
    COUNT(CASE WHEN ef.prioridad = 'baja' THEN 1 END) as baja_prioridad
FROM usuario u
LEFT JOIN evento_favorito ef ON u.id_usuario = ef.id_usuario AND ef.deleted_at IS NULL
WHERE u.deleted_at IS NULL
GROUP BY u.id_usuario, u.correo;

-- Trigger: Actualizar updated_at automáticamente
DELIMITER //
CREATE TRIGGER `tr_evento_favorito_update` 
BEFORE UPDATE ON `evento_favorito`
FOR EACH ROW
BEGIN
    SET NEW.updated_at = NOW();
END //
DELIMITER ;

-- Índices adicionales útiles
CREATE INDEX IF NOT EXISTS `idx_evento_favorito_recordatorio_fecha` ON `evento_favorito` (`recordatorio`, `fecha_recordatorio`);
CREATE INDEX IF NOT EXISTS `idx_evento_favorito_prioridad` ON `evento_favorito` (`prioridad`);

-- Comentario: Este script solo deja la tabla y vistas de favoritos. Elimina cualquier tabla, trigger o vista que no esté aquí si no la usas. 
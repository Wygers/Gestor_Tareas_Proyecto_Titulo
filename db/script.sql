SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS sistema_gestor_tareas;
SET FOREIGN_KEY_CHECKS = 1;

CREATE DATABASE sistema_gestor_tareas
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sistema_gestor_tareas;

CREATE TABLE organizacion (
    id_organizacion INT AUTO_INCREMENT PRIMARY KEY,
    nombre_organizacion VARCHAR(100) NOT NULL,
    rut_organizacion VARCHAR(12) NOT NULL UNIQUE,
    correo_contacto VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_organizacion INT NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'supervisor', 'tecnico', 'visualizador') NOT NULL DEFAULT 'visualizador',
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    intentos_fallidos TINYINT DEFAULT 0,
    bloqueado_hasta DATETIME NULL,
    ultimo_login DATETIME NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_organizacion) REFERENCES organizacion(id_organizacion)
);

CREATE TABLE proyecto (
    id_proyecto INT AUTO_INCREMENT PRIMARY KEY,
    id_organizacion INT NOT NULL,
    nombre_proyecto VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_termino DATE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_organizacion) REFERENCES organizacion(id_organizacion)
);

CREATE TABLE categoria_tarea (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    id_organizacion INT NOT NULL,
    nombre_categoria VARCHAR(50) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_organizacion) REFERENCES organizacion(id_organizacion),
    UNIQUE KEY uk_org_categoria (id_organizacion, nombre_categoria)
);

CREATE TABLE prioridad_tarea (
    id_prioridad INT AUTO_INCREMENT PRIMARY KEY,
    nombre_prioridad VARCHAR(20) NOT NULL UNIQUE,
    nivel_urgencia TINYINT NOT NULL,
    color_css VARCHAR(20),
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE estado_tarea (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(30) NOT NULL UNIQUE,
    orden_flujo TINYINT NOT NULL,
    es_final BOOLEAN DEFAULT FALSE,
    color_css VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE tarea (
    id_tarea INT AUTO_INCREMENT PRIMARY KEY,
    codigo_tarea VARCHAR(20) NOT NULL UNIQUE,
    id_organizacion INT NOT NULL,
    id_proyecto INT NULL,
    id_categoria INT NULL,
    id_prioridad INT NOT NULL,
    id_estado INT NOT NULL,
    id_usuario_creador INT NOT NULL,
    id_usuario_asignado INT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    ubicacion_referencial VARCHAR(255),
    fecha_inicio DATE,
    fecha_limite DATE,
    fecha_cierre DATE,
    porcentaje_avance DECIMAL(5,2) DEFAULT 0,
    observaciones TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_usuario_modificador INT NULL,
    FOREIGN KEY (id_organizacion) REFERENCES organizacion(id_organizacion),
    FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto),
    FOREIGN KEY (id_categoria) REFERENCES categoria_tarea(id_categoria),
    FOREIGN KEY (id_prioridad) REFERENCES prioridad_tarea(id_prioridad),
    FOREIGN KEY (id_estado) REFERENCES estado_tarea(id_estado),
    FOREIGN KEY (id_usuario_creador) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_usuario_asignado) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_usuario_modificador) REFERENCES usuario(id_usuario)
);

CREATE TABLE asignacion_tarea (
    id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_tecnico INT NOT NULL,
    id_supervisor INT NOT NULL,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_limite_asignacion DATE,
    comentario_asignacion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_tarea) REFERENCES tarea(id_tarea),
    FOREIGN KEY (id_tecnico) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_supervisor) REFERENCES usuario(id_usuario),
    UNIQUE KEY uk_tarea_tecnico_activo (id_tarea, id_tecnico, activo)
);

CREATE TABLE evidencia_tarea (
    id_evidencia INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_usuario_subida INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_archivo VARCHAR(100),
    tamano_bytes BIGINT,
    descripcion TEXT,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarea) REFERENCES tarea(id_tarea),
    FOREIGN KEY (id_usuario_subida) REFERENCES usuario(id_usuario)
);

CREATE TABLE historial_tarea (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    accion VARCHAR(50) NOT NULL,
    campo_modificado VARCHAR(50),
    valor_anterior TEXT,
    valor_nuevo TEXT,
    comentario TEXT,
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(45),
    FOREIGN KEY (id_tarea) REFERENCES tarea(id_tarea),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE comentario_tarea (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    comentario TEXT NOT NULL,
    fecha_comentario DATETIME DEFAULT CURRENT_TIMESTAMP,
    editado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_tarea) REFERENCES tarea(id_tarea),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE logs_sistema (
    id_log BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    id_organizacion INT NULL,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INT,
    ip_origen VARCHAR(45),
    user_agent TEXT,
    datos_json JSON,
    fecha_hora DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

INSERT INTO prioridad_tarea (nombre_prioridad, nivel_urgencia, color_css, descripcion) VALUES
('Baja', 1, '#28a745', 'Tareas que pueden esperar'),
('Media', 2, '#007bff', 'Seguimiento normal'),
('Alta', 3, '#ffc107', 'Requiere atención pronta'),
('Crítica', 4, '#dc3545', 'Atención inmediata');

INSERT INTO estado_tarea (nombre_estado, orden_flujo, es_final, color_css) VALUES
('Pendiente', 1, FALSE, '#6c757d'),
('Asignada', 2, FALSE, '#17a2b8'),
('En Proceso', 3, FALSE, '#007bff'),
('En Revisión', 4, FALSE, '#ffc107'),
('Finalizada', 5, TRUE, '#28a745'),
('Cancelada', 6, TRUE, '#dc3545');

DELIMITER //
CREATE TRIGGER tr_generar_codigo_tarea
BEFORE INSERT ON tarea
FOR EACH ROW
BEGIN
    DECLARE next_num INT;
    IF NEW.codigo_tarea IS NULL OR NEW.codigo_tarea = '' THEN
        SELECT IFNULL(MAX(CAST(SUBSTRING(codigo_tarea, 3) AS UNSIGNED)), 0) + 1 INTO next_num FROM tarea;
        SET NEW.codigo_tarea = CONCAT('T-', LPAD(next_num, 3, '0'));
    END IF;
END//
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;
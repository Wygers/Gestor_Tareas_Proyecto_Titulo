SET FOREIGN_KEY_CHECKS=0;
DROP DATABASE IF EXISTS sistema_gtp;
SET FOREIGN_KEY_CHECKS=1;
CREATE DATABASE sistema_gtp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_gtp;

CREATE TABLE organizaciones (
    id_organizacion INT AUTO_INCREMENT PRIMARY KEY,
    nombre_organizacion VARCHAR(150) NOT NULL,
    rut_organizacion VARCHAR(20),
    correo_contacto VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE prioridades_tarea (
    id_prioridad INT AUTO_INCREMENT PRIMARY KEY,
    nombre_prioridad VARCHAR(50) NOT NULL,
    nivel INT NOT NULL,
    color VARCHAR(30)
) ENGINE=InnoDB;

CREATE TABLE estados_tarea (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL,
    orden_flujo INT,
    color VARCHAR(30)
) ENGINE=InnoDB;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_organizacion INT NOT NULL,
    nombre_completo VARCHAR(120) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('admin','supervisor','ejecutor','visualizador') DEFAULT 'visualizador',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_organizacion) REFERENCES organizaciones(id_organizacion)
) ENGINE=InnoDB;

CREATE TABLE proyectos (
    id_proyecto INT AUTO_INCREMENT PRIMARY KEY,
    id_organizacion INT NOT NULL,
    nombre_proyecto VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    FOREIGN KEY (id_organizacion) REFERENCES organizaciones(id_organizacion)
) ENGINE=InnoDB;

CREATE TABLE categorias_tarea (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    id_organizacion INT NOT NULL,
    nombre_categoria VARCHAR(100) NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (id_organizacion) REFERENCES organizaciones(id_organizacion)
) ENGINE=InnoDB;

CREATE TABLE tareas (
    id_tarea INT AUTO_INCREMENT PRIMARY KEY,
    id_organizacion INT NOT NULL,
    id_proyecto INT NULL,
    id_categoria INT NULL,
    id_prioridad INT NOT NULL,
    id_estado INT NOT NULL,
    id_usuario_creador INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    ubicacion_referencial VARCHAR(200),
    fecha_inicio DATE,
    fecha_limite DATE,
    fecha_cierre DATETIME NULL,
    porcentaje_avance DECIMAL(5,2) DEFAULT 0.00,
    observaciones TEXT,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (id_organizacion) REFERENCES organizaciones(id_organizacion),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto),
    FOREIGN KEY (id_categoria) REFERENCES categorias_tarea(id_categoria),
    FOREIGN KEY (id_prioridad) REFERENCES prioridades_tarea(id_prioridad),
    FOREIGN KEY (id_estado) REFERENCES estados_tarea(id_estado),
    FOREIGN KEY (id_usuario_creador) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE tarea_responsables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    tipo ENUM('principal','apoyo') DEFAULT 'principal',
    FOREIGN KEY (id_tarea) REFERENCES tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE seguimiento_tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    comentario TEXT,
    porcentaje_avance DECIMAL(5,2),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarea) REFERENCES tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE evidencias_tarea (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    nombre_archivo VARCHAR(255),
    tipo_archivo VARCHAR(100),
    archivo LONGBLOB,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarea) REFERENCES tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE comentarios_tarea (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    comentario TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarea) REFERENCES tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE alertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT,
    mensaje TEXT,
    leida BOOLEAN DEFAULT FALSE,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarea) REFERENCES tareas(id_tarea) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    accion VARCHAR(100),
    modulo VARCHAR(50),
    id_referencia INT,
    detalle TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

INSERT INTO prioridades_tarea (nombre_prioridad, nivel, color) VALUES
('Baja',1,'secondary'),
('Media',2,'primary'),
('Alta',3,'warning'),
('Crítica',4,'danger');

INSERT INTO estados_tarea (nombre_estado, orden_flujo, color) VALUES
('Pendiente',1,'warning'),
('En Proceso',2,'primary'),
('Finalizada',3,'success'),
('Vencida',4,'danger');
INSERT INTO organizaciones (nombre_organizacion) VALUES ('Empresa Demo');
INSERT INTO usuarios (id_organizacion, nombre_completo, correo, contrasena, tipo_usuario)
VALUES (1, 'Admin Demo', 'admin@demo.cl', '$2a$10$abcdefghijklmnopqrstuv', 'admin');
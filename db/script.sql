SET FOREIGN_KEY_CHECKS=0;
DROP DATABASE IF EXISTS sistema_gtp;
SET FOREIGN_KEY_CHECKS=1;

CREATE DATABASE sistema_gtp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_gtp;

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    foto_perfil VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_login DATETIME NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
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

CREATE TABLE categorias_tarea (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL,
    descripcion TEXT
) ENGINE=InnoDB;

CREATE TABLE proyectos (
    id_proyecto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_proyecto VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE tareas (
    id_tarea INT AUTO_INCREMENT PRIMARY KEY,
    id_proyecto INT NULL,
    id_categoria INT NULL,
    id_prioridad INT NOT NULL,
    id_estado INT NOT NULL,
    id_usuario_creador INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    ubicacion_referencial VARCHAR(255),
    fecha_inicio DATE,
    fecha_limite DATE,
    fecha_cierre DATETIME NULL,
    porcentaje_avance DECIMAL(5,2) DEFAULT 0.00,
    observaciones TEXT,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

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
    asignado_por INT NOT NULL,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_tarea) REFERENCES tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE seguimiento_tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    comentario TEXT,
    porcentaje_avance DECIMAL(5,2),
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_tarea) REFERENCES tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE evidencias_tarea (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    nombre_archivo VARCHAR(255),
    ruta_archivo VARCHAR(255),
    tipo_archivo VARCHAR(100),
    tamano_archivo VARCHAR(50),
    descripcion TEXT,
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
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    titulo VARCHAR(150),
    mensaje TEXT,

    tipo_alerta ENUM(
        'vencimiento',
        'atraso',
        'reasignacion',
        'comentario',
        'avance',
        'finalizacion'
    ),

    leida BOOLEAN DEFAULT FALSE,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_tarea) REFERENCES tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE configuracion_alertas (
    id_configuracion INT AUTO_INCREMENT PRIMARY KEY,
    dias_anticipacion INT DEFAULT 3,
    enviar_correo BOOLEAN DEFAULT TRUE,
    mostrar_dashboard BOOLEAN DEFAULT TRUE,
    alerta_vencimiento BOOLEAN DEFAULT TRUE,
    alerta_atraso BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    accion VARCHAR(100),
    modulo VARCHAR(50),
    id_referencia INT,
    detalle TEXT,
    ip_usuario VARCHAR(50),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    titulo VARCHAR(150),
    mensaje TEXT,
    leida BOOLEAN DEFAULT FALSE,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO roles (nombre_rol, descripcion) VALUES
('admin','Control total del sistema'),
('supervisor','Gestiona y asigna tareas'),
('ejecutor','Ejecuta tareas asignadas'),
('visualizador','Solo lectura');

INSERT INTO prioridades_tarea (nombre_prioridad, nivel, color) VALUES
('Baja',1,'secondary'),
('Media',2,'primary'),
('Alta',3,'warning'),
('Crítica',4,'danger');

INSERT INTO estados_tarea (nombre_estado, orden_flujo, color) VALUES
('Pendiente',1,'warning'),
('En Proceso',2,'primary'),
('En Revisión',3,'info'),
('Finalizada',4,'success'),
('Vencida',5,'danger'),
('Cancelada',6,'secondary');

INSERT INTO categorias_tarea (nombre_categoria, descripcion) VALUES
('Desarrollo','Tareas de programación'),
('Soporte','Incidentes y soporte'),
('QA','Pruebas y testing'),
('Documentación','Gestión documental'),
('Administrativo','Procesos administrativos');

INSERT INTO proyectos (
    nombre_proyecto,
    descripcion,
    fecha_inicio,
    activo
)
VALUES (
    'Sistema Gestor de Tareas',
    'Proyecto principal de gestión y seguimiento operativo',
    CURDATE(),
    TRUE
);

INSERT INTO configuracion_alertas (
    dias_anticipacion,
    enviar_correo,
    mostrar_dashboard,
    alerta_vencimiento,
    alerta_atraso
)
VALUES (
    3,
    TRUE,
    TRUE,
    TRUE,
    TRUE
);
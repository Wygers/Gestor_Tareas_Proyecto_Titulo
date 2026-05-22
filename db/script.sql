SET FOREIGN_KEY_CHECKS=0;
DROP DATABASE IF EXISTS sistema_gtp;
SET FOREIGN_KEY_CHECKS=1;

CREATE DATABASE sistema_gtp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_gtp;

-- 1. CLIENTES (Organizaciones)
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cliente VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. ROLES (Definidos para el Login funcional)
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL, -- admin, supervisor, actualizador, visualizador
    descripcion VARCHAR(255)
);

-- 3. USUARIOS (CRUD Completo)
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_rol INT NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL, -- Hasheada
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_login DATETIME DEFAULT NULL,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- 4. CONFIGURACIONES DE TAREA (Prioridades con Color)
CREATE TABLE prioridades_tarea (
    id_prioridad INT AUTO_INCREMENT PRIMARY KEY,
    nombre_prioridad VARCHAR(50) NOT NULL,
    color_css VARCHAR(20) NOT NULL, -- Ejemplo: #FF0000 o 'danger'
    nivel_urgencia INT NOT NULL
);

CREATE TABLE estados_tarea (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL,
    orden_flujo INT NOT NULL
);

-- 5. TAREAS (El núcleo del sistema)
CREATE TABLE tareas (
    id_tarea INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_prioridad INT NOT NULL,
    id_estado INT NOT NULL,
    id_usuario_creador INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_limite DATE,
    porcentaje_avance DECIMAL(5,2) DEFAULT 0.00, -- 0.00 a 100.00
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_prioridad) REFERENCES prioridades_tarea(id_prioridad),
    FOREIGN KEY (id_estado) REFERENCES estados_tarea(id_estado),
    FOREIGN KEY (id_usuario_creador) REFERENCES usuarios(id_usuario)
);

-- 6. ASIGNACIÓN Y SEGUIMIENTO
CREATE TABLE tarea_responsables (
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    PRIMARY KEY (id_tarea, id_usuario),
    FOREIGN KEY (id_tarea) REFERENCES tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Historial para auditar el porcentaje de avance
CREATE TABLE seguimiento_tareas (
    id_seguimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    id_usuario INT NOT NULL,
    comentario TEXT,
    porcentaje_antes DECIMAL(5,2),
    porcentaje_despues DECIMAL(5,2),
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarea) REFERENCES tareas(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- 7. LOGS DE AUDITORÍA (Estilo JSON como pediste)
CREATE TABLE logs_cambios (
    id_log BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tabla_afectada VARCHAR(50) NOT NULL,
    operacion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores JSON DEFAULT NULL,
    datos_nuevos JSON DEFAULT NULL,
    fecha_hora DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- 8. DATOS INICIALES (Para que tu sistema sea funcional desde el minuto 1)
INSERT INTO roles (nombre_rol, descripcion) VALUES 
('admin', 'Acceso total'), 
('supervisor', 'Gestión de proyectos y asignaciones'), 
('actualizador', 'Solo actualiza avance de sus tareas'), 
('visualizador', 'Solo lectura');

INSERT INTO prioridades_tarea (nombre_prioridad, color_css, nivel_urgencia) VALUES 
('Baja', 'success', 1), 
('Media', 'primary', 2), 
('Alta', 'warning', 3), 
('Crítica', 'danger', 4);

INSERT INTO estados_tarea (nombre_estado, orden_flujo) VALUES 
('Pendiente', 1), ('En Proceso', 2), ('Finalizada', 3);
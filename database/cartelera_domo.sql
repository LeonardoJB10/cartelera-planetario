-- Script SQL para crear la base de datos cartelera_domo
-- Compatible con MySQL y phpMyAdmin

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS cartelera_domo 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE cartelera_domo;

-- Tabla usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'cliente') NOT NULL DEFAULT 'cliente',
    correo VARCHAR(100) NOT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla peliculas
CREATE TABLE peliculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    duracion INT NOT NULL,
    clasificacion VARCHAR(10) NOT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- Tabla funciones
CREATE TABLE funciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pelicula INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    sala VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_pelicula) REFERENCES peliculas(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla noticias
CREATE TABLE noticias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- Insertar datos de ejemplo para usuarios
INSERT INTO usuarios (nombre, usuario, contraseña, rol, correo) VALUES
('Administrador Principal', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'administrador', 'admin@planetario.com'),
('Juan Pérez', 'jperez', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', 'juan.perez@email.com'),
('María García', 'mgarcia', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', 'maria.garcia@email.com');

-- Insertar datos de ejemplo para películas
INSERT INTO peliculas (titulo, descripcion, duracion, clasificacion) VALUES
('Viaje al Centro de la Tierra', 'Un viaje fascinante al centro de nuestro planeta, explorando las maravillas geológicas y la estructura interna de la Tierra.', 15, 'A'),
('El Universo en 3D', 'Explora el universo en una experiencia inmersiva que te llevará desde nuestro sistema solar hasta las galaxias más lejanas.', 20, 'AA'),
('Marte: El Planeta Rojo', 'Descubre los secretos de Marte, sus características únicas y las misiones espaciales que han explorado este fascinante planeta.', 18, 'A'),
('Constelaciones del Hemisferio Sur', 'Un recorrido por las constelaciones visibles desde el hemisferio sur, aprendiendo sobre mitología y astronomía.', 12, 'A');

-- Insertar datos de ejemplo para funciones
INSERT INTO funciones (id_pelicula, fecha, hora, sala) VALUES
(1, '2024-09-20', '10:00:00', 'Sala Principal'),
(1, '2024-09-20', '14:00:00', 'Sala Principal'),
(1, '2024-09-20', '18:00:00', 'Sala Principal'),
(2, '2024-09-20', '11:00:00', 'Sala Principal'),
(2, '2024-09-20', '15:00:00', 'Sala Principal'),
(2, '2024-09-20', '19:00:00', 'Sala Principal'),
(3, '2024-09-21', '10:30:00', 'Sala Principal'),
(3, '2024-09-21', '14:30:00', 'Sala Principal'),
(4, '2024-09-21', '12:00:00', 'Sala Principal'),
(4, '2024-09-21', '16:00:00', 'Sala Principal');

-- Insertar datos de ejemplo para noticias
INSERT INTO noticias (titulo, contenido) VALUES
('Nuevo Corto Disponible', 'Se ha agregado un nuevo corto a nuestra cartelera: "Marte: El Planeta Rojo". Una experiencia inmersiva que te llevará a explorar los secretos del planeta rojo.'),
('Horarios Especiales de Fin de Semana', 'Este fin de semana tendremos horarios especiales con funciones adicionales en la Sala Principal. No te pierdas nuestras proyecciones en domo digital.'),
('Mantenimiento Programado', 'El próximo lunes realizaremos mantenimiento preventivo en nuestro sistema de proyección. Las funciones se reanudarán el martes con horarios normales.');

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_usuarios_usuario ON usuarios(usuario);
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_peliculas_titulo ON peliculas(titulo);
CREATE INDEX idx_peliculas_estado ON peliculas(estado);
CREATE INDEX idx_funciones_fecha ON funciones(fecha);
CREATE INDEX idx_funciones_id_pelicula ON funciones(id_pelicula);
CREATE INDEX idx_noticias_fecha ON noticias(fecha_publicacion);
CREATE INDEX idx_noticias_estado ON noticias(estado);

-- Mostrar información de las tablas creadas
SHOW TABLES;

-- Mostrar estructura de cada tabla
DESCRIBE usuarios;
DESCRIBE peliculas;
DESCRIBE funciones;
DESCRIBE noticias;

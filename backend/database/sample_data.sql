-- Sample data for Netflix clone app

-- Insert sample content (movies and series)
INSERT INTO content (title, description, type, genre, release_year, duration_minutes, seasons, rating, thumbnail_url, backdrop_url, video_url, trailer_url, is_featured) VALUES
-- Featured content
('Death Note', 'Un estudiante de secundaria encuentra un cuaderno sobrenatural que le permite matar a cualquier persona cuyo nombre escriba en él.', 'series', 'Anime', 2006, NULL, 1, 'TV-14', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4', true),

-- Movies
('El Padrino', 'La historia de una familia de la mafia italiana en Nueva York.', 'movie', 'Drama', 1972, 175, NULL, 'R', 'https://images.unsplash.com/photo-1489599735734-79b4f9ab7b34?w=300&h=450&fit=crop', 'https://images.unsplash.com/photo-1489599735734-79b4f9ab7b34?w=1920&h=1080&fit=crop', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4', false),

('Avengers: Endgame', 'Los Vengadores se unen para deshacer las acciones de Thanos y restaurar el orden en el universo.', 'movie', 'Acción', 2019, 181, NULL, 'PG-13', 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=450&fit=crop', 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1920&h=1080&fit=crop', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4', false),

('Coco', 'Un niño mexicano viaja al mundo de los muertos para descubrir la verdad sobre su familia.', 'movie', 'Infantil', 2017, 105, NULL, 'PG', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4', false),

-- Series
('Stranger Things', 'Un grupo de niños en los años 80 descubre fuerzas sobrenaturales en su pequeño pueblo.', 'series', 'Terror', 2016, NULL, 4, 'TV-14', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=450&fit=crop', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1920&h=1080&fit=crop', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4', true),

('Breaking Bad', 'Un profesor de química se convierte en fabricante de metanfetaminas tras ser diagnosticado con cáncer.', 'series', 'Drama', 2008, NULL, 5, 'TV-MA', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920&h=1080&fit=crop', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4', false),

('The Office', 'Una comedia que sigue la vida diaria de los empleados de una oficina de papel.', 'series', 'Comedia', 2005, NULL, 9, 'TV-14', 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=300&h=450&fit=crop', 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1920&h=1080&fit=crop', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4', false),

('Naruto', 'Un joven ninja busca reconocimiento y sueña con convertirse en el líder de su aldea.', 'series', 'Anime', 2002, NULL, 1, 'TV-PG', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4', false),

('Planet Earth', 'Una serie documental que explora la vida salvaje y los paisajes naturales de nuestro planeta.', 'series', 'Documentales', 2006, NULL, 1, 'TV-G', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=450&fit=crop', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4', false);

-- Insert sample episodes for Death Note
INSERT INTO episodes (content_id, season_number, episode_number, title, description, duration_minutes, video_url, thumbnail_url) VALUES
(1, 1, 1, 'Renacimiento', 'Light Yagami encuentra el Death Note y conoce a Ryuk.', 23, 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=169&fit=crop'),
(1, 1, 2, 'Confrontación', 'Light comienza a usar el Death Note para eliminar criminales.', 23, 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=169&fit=crop'),
(1, 1, 3, 'Transacciones', 'L aparece para investigar las misteriosas muertes.', 23, 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=169&fit=crop');

-- Insert sample episodes for Stranger Things
INSERT INTO episodes (content_id, season_number, episode_number, title, description, duration_minutes, video_url, thumbnail_url) VALUES
(5, 1, 1, 'La desaparición de Will Byers', 'Will Byers desaparece misteriosamente camino a casa.', 47, 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=169&fit=crop'),
(5, 1, 2, 'La loca de la calle Maple', 'Los chicos buscan a Will mientras Eleven escapa del laboratorio.', 55, 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=169&fit=crop');

-- Map content to categories
INSERT INTO content_category_mapping (content_id, category_id) VALUES
-- Death Note
(1, 1), -- Tendencias
(1, 8), -- Anime

-- El Padrino
(2, 5), -- Drama

-- Avengers: Endgame
(3, 1), -- Tendencias
(3, 3), -- Acción

-- Coco
(4, 9), -- Infantil

-- Stranger Things
(5, 1), -- Tendencias
(5, 6), -- Terror

-- Breaking Bad
(6, 5), -- Drama

-- The Office
(7, 4), -- Comedia

-- Naruto
(8, 8), -- Anime

-- Planet Earth
(9, 7); -- Documentales
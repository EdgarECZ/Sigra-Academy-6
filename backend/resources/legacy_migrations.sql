-- MIGRACIONES DE TABLAS Y ALTERACIONES IMPORTANTES
-- Archivo generado a partir de scripts legacy para facilitar su ejecución en MySQL Workbench
-- NOTA: Se han eliminado las secciones relacionadas con la tabla de profesores según petición del equipo.

-- 2. Agregar columna frequency a attendance_sessions (de add_attendance_frequency.mjs)
ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS frequency ENUM('weekly','daily') NOT NULL DEFAULT 'weekly';

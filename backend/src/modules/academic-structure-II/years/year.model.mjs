import { db } from "../../../../database/db.database.mjs";

// Modelo que interactua con la tabla grades de la base de datos
export class YearModel {
    // Método para obtener todos los años académicos
    static async getAllYears(){
        const [years] = await db.query(
            `SELECT * FROM academic_years`
        );
        if(years.length === 0) return {error: 'No hay años académicos registrados'};
        return {
            message: 'Años académicos obtenidos correctamente',
            years: years
        }
    }

    // Método para obtener un año académico por su ID
    static async getYearById(yearId){
        if(!yearId) return {error: 'El ID del año académico es requerido'};
        const [year] = await db.query(
            `SELECT ay.year_id, ay.name, ay.start_date, ay.end_date, s.section_name,
             g.grade_name FROM academic_years ay JOIN sections s ON ay.year_id = s.academic_year_id
             JOIN grades g ON s.grade_id = g.grade_id WHERE ay.year_id = ?`,
            [yearId]
        );
        if(year.length === 0) return {error: 'Año académico no encontrado'};
        return {
            message: 'Año académico obtenido correctamente',
            year: year
        }
    }

    // Método para crear un nuevo año académico
    static async createYear(data){
        if(!data) return {error: 'Faltan datos para crear el año académico'};
        const { name, start_date, end_date } = data;
        // Se verifica que no exista un año académico con el mismo nombre
        const [existingYear] = await db.query(
            `SELECT * FROM academic_years WHERE name = ?`,
            [name]
        );
        if(existingYear.length > 0) return {error: 'Ya existe un año académico con ese nombre'};
        // Si no existe, se crea el nuevo año académico
        const [result] = await db.query(
            `INSERT INTO academic_years (name, start_date, end_date) VALUES (?, ?, ?)`,
            [name, start_date, end_date]
        );
        // Se obtiene el año académico creado
        const [newYear] = await db.query(
            `SELECT * FROM academic_years WHERE year_id = ?`,
            [result.insertId]
        );
        if(newYear.length === 0) return {error: 'Error al crear el año académico'};
        return {
            message: 'Año académico creado correctamente',
            year: newYear
        }
    }

    // Método para actualizar un año académico
    static async updateYear(yearId, data){
        if(!yearId || !data) return {error: 'El ID del año académico y los datos son requeridos'};
        const allowedFields = ['name', 'start_date', 'end_date'];
        const updateToFields = {};
        for(const field of allowedFields){
            if(data[field] !== undefined){
                updateToFields[field] = data[field];
            }
        }

        // Se verifica si existe el año académico
        const [existingYear] = await db.query(
            `SELECT * FROM academic_years WHERE year_id = ?`,
            [yearId]
        );
        if(existingYear.length === 0) return {error: 'Año académico no encontrado'};
        // Si existe, se procede a actualizarlo
        const fields = [];
        const values = [];

        Object.entries(updateToFields).forEach(([key, value]) => {
            fields.push(`${key} = ?`);
            values.push(value);
        });
        values.push(yearId); // Agrega el ID del año al final para la cláusula WHERE
        const [result] = await db.query(
            `UPDATE academic_years SET ${fields.join(', ')} WHERE year_id = ?`,
            values
        );
        // Se obtiene el año académico actualizado
        const [newYear] = await db.query(
            `SELECT * FROM academic_years WHERE year_id = ?`,
            [yearId]
        );
        if(newYear.length === 0) return {error: 'Error al actualizar el año académico'};
        return {
            message: 'Año académico actualizado correctamente',
            year: newYear
        }
    }

    // Método para cambiar el estado activo/desactivo de un año académico
    static async toggleYearStatus(yearId, isActive){
        if(!yearId || isActive === undefined) return {error: 'El ID del año académico y el estado son requeridos'};
        // Se verifica si existe el año académico
        const [existingYear] = await db.query(
            `SELECT * FROM academic_years WHERE year_id = ?`,
            [yearId]
        );
        if(existingYear.length === 0) return {error: 'Año académico no encontrado'};
        // Si existe, se procede a actualizar su estado
        const [result] = await db.query(
            `UPDATE academic_years SET is_active = ? WHERE year_id = ?`,
            [isActive, yearId]
        );
        if(result.affectedRows === 0) return {error: 'Error al actualizar el estado del año académico'};
        return {
            message: `Año académico ${isActive ? 'activado' : 'desactivado'} correctamente`
        }
    }

    // Método para eliminar un año académico
    static async deleteYear(yearId){
        if(!yearId) return {error: 'El ID del año académico es requerido'};
        // Se verifica si existe el año académico
        const [existingYear] = await db.query(
            `SELECT * FROM academic_years WHERE year_id = ?`,
            [yearId]
        );
        if(existingYear.length === 0) return {error: 'Año académico no encontrado'};
        // Si existe, se procede a eliminarlo
        const [result] = await db.query(
            `DELETE FROM academic_years WHERE year_id = ?`,
            [yearId]
        );
        if(result.affectedRows === 0) return {error: 'Error al eliminar el año académico'};
        return {
            message: 'Año académico eliminado correctamente'
        }
    }
}
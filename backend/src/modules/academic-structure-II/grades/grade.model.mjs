import { db } from "../../../../database/db.database.mjs";

// Modelo que interactua con la tabla grades de la base de datos
export class GradeModel {
    // Método para obtener todos los grados académicos
    static async getAllGrades(){
        const [grades] = await db.query(
            `SELECT * FROM grades`
        );
        if(grades.length === 0) return {error: 'No hay grados registrados'};
        return {
            message: 'Grados obtenidos correctamente',
            grades: grades
        }
    }

    // Método para crear un nuevo grado académico
    static async createGrade(data){
        if(!data) return {error: 'Faltan datos para crear el grado'};
        const {grade_name, level_order} = data;
        // Se verifica que no exista un grado con el mismo nombre
        const [existingGrade] = await db.query(
            `SELECT * FROM grades WHERE grade_name = ?`,
            [grade_name]
        );
        if(existingGrade.length > 0) return {error: 'Ya existe un grado con ese nombre'};
        // Si no existe, se crea el nuevo grado
        const [result] = await db.query(
            `INSERT INTO grades (grade_name, level_order) VALUES (?, ?)`,
            [grade_name, level_order]
        );
        // Se obtiene el grado creado
        const [newGrade] = await db.query(
            `SELECT * FROM grades WHERE grade_id = ?`,
            [result.insertId]
        );
        if(newGrade.length === 0) return {error: 'Error al crear el grado'};
        return {
            message: 'Grado creado correctamente',
            grade: newGrade
        }
    }

    // Método para actualizar un grado académico
    static async updateGrade(gradeId, data){
        if(!gradeId || !data) return {error: 'El ID del grado y los datos son requeridos'};
        const allowedFields = ['grade_name', 'level_order'];
        const updateToFields = {};
        for(const field of allowedFields){
            if(data[field] !== undefined){
                updateToFields[field] = data[field];
            }
        }

        // Se verifica si existe el grado
        const [existingGrade] = await db.query(
            `SELECT * FROM grades WHERE grade_id = ?`,
            [gradeId]
        );
        if(existingGrade.length === 0) return {error: 'Grado no encontrado'};
        // Si existe, se procede a actualizarlo
        const fields = [];
        const values = [];

        Object.keys(updateToFields).forEach((key) => {
            fields.push(`${key} = ?`);
            values.push(updateToFields[key]);
        });
        values.push(gradeId); // Para la cláusula WHERE

        const [updatedGrade] = await db.query(
            `UPDATE grades SET ${fields.join(', ')} WHERE grade_id = ?`,
            values
        );
        // Se obtiene el grado actualizado
        const [newGrade] = await db.query(
            `SELECT * FROM grades WHERE grade_id = ?`,
            [gradeId]
        );
        if(newGrade.length === 0) return {error: 'Error al actualizar el grado'};
        return {
            message: 'Grado actualizado correctamente',
            grade: newGrade
        }
    }

    // Método para eliminar un grado académico
    static async deleteGrade(gradeId){
        if(!gradeId) return {error: 'El ID del grado es requerido'};
        // Se verifica si el grado existe
        const [existingGrade] = await db.query(
            `SELECT * FROM grades WHERE grade_id = ?`,
            [gradeId]
        );
        if(existingGrade.length === 0) return {error: 'Grado no encontrado'};
        // Si existe, se borra el grado
        const [deletedGrade] = await db.query(
            `DELETE FROM grades WHERE grade_id = ?`,
            [gradeId]
        );
        if(deletedGrade.affectedRows === 0) return {error: 'Error al eliminar el grado'};
        return {
            message: 'Grado eliminado correctamente'
        }
    }
}
import { db } from '../../../../database/db.database.mjs'

export class subjectModel{
    // metodo para obtener todas las materias
    static async getAllSubjects(){
        const [subjects] = await db.query(
            `SELECT s.*, g.grade_name
             FROM subjects s
             JOIN grades g ON s.grade_id = g.grade_id`
        )
        if(subjects.length === 0) return {error:"No se han encontrado materias"}
        return { 
            message:"Se han obtenido las materias exitosamente",
            subjects: subjects
        }
    }

    // metodo para obtener una materia con su respectivo grado por su ID
    static async getSubjectById(subjectId){
        if(!subjectId) return {error: "El ID de la materia es requerido"}
        const [subject] = await db.query(
            `SELECT s.*, g.grade_name
             FROM subjects s
             JOIN grades g ON s.grade_id = g.grade_id
             WHERE s.subject_id = ?`,
            [subjectId]
        );
        if(subject.length === 0) return {error: "Materia no encontrada"}
        return {
            message: "Materia obtenida exitosamente",
            subject: subject[0]
        }
    }

    // metodo para crear una materia
    static async createSubject(data){
        if(!data) return {error: 'Faltan datos para crear la materia'};
        const { grade_id, ...rest } = data;
        // Se verifica si el grado existe
        const [existingGrade] = await db.query(
            `SELECT * FROM grades WHERE grade_id = ?`,
            [grade_id]
        );
        // A su vez, se verfica si ya existe una materia con el mismo nombre o codigo
        const [exisitingSubject] = await db.query(
            `SELECT * FROM subjects WHERE subject_name = ? OR code_subject = ?`,
            [rest.subject_name, rest.code_subject]
        );
        if(existingGrade.length === 0 || exisitingSubject.length > 0){
            return {error: 'Grado no encontrado o materia ya existe'};
        }
        // Si todo esta bien, se crea la materia
        const [result] = await db.query(
            `INSERT INTO subjects (grade_id, subject_name, code_subject, description)
            VALUES (?, ?, ?, ?)`,
            [grade_id, rest.subject_name, rest.code_subject, rest.description]
        );
        // Se obtiene la materia creada
        const [createdSubject] = await db.query(
            `SELECT * FROM subjects WHERE subject_id = ? LIMIT 1`,
            [result.insertId]
        );
        if(createdSubject.length === 0) return {error: 'Error al crear la materia'};
        return {
            message: 'Materia creada correctamente',
            subject: createdSubject[0]
        }
    }

    // metodo para actualizar una materia
    static async updateSubject(subjectId, data){
        if(!subjectId || !data) return {error: 'Faltan datos para actualizar la materia'};
        // Designó los campos que se va actualizar
        const allowedFields = ['grade_id', 'subject_name', 'code_subject', 'description', 'is_active'];
        const updateToFields = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateToFields[field] = data[field];
            }
        }
        // Se verifica si la materia existe
        const [existingSubject] = await db.query(
            `SELECT * FROM subjects WHERE subject_id = ?`,
            [subjectId]
        );
        if(existingSubject.length === 0) return {error: 'Materia no encontrada'};
        // Si existe, se procede a actualizarlo
        const fields = [];
        const values = [];

        Object.entries(updateToFields).forEach(([key, value]) => {
            fields.push(`${key} = ?`);
            values.push(value);
        });
        values.push(subjectId); // Agrega el subject_id al final para la cláusula WHERE

        const [updatedSubject] = await db.query(
            `UPDATE subjects SET ${fields.join(', ')} WHERE subject_id = ?`,
            values
        );
        if(updatedSubject.affectedRows === 0) return {error: 'Error al actualizar la materia'};
        // Se obtiene la materia actualizada
        const [subject] = await db.query(
            `SELECT * FROM subjects WHERE subject_id = ? LIMIT 1`,
            [subjectId]
        );
        return {
            message: 'Materia actualizada correctamente',
            subject: subject[0]
        }
    }

    // metodo para eliminar una materia
    static async deleteSubject(subjectId){
        if(!subjectId) return {error: 'El ID de la materia es requerido'};
        // Se verifica si existe la materia
        const [existingSubject] = await db.query(
            `SELECT * FROM subjects WHERE subject_id = ?`,
            [subjectId]
        );
        if(existingSubject.length === 0) return {error: 'Materia no encontrada'};
        // Si existe, se elimina la materia
        const [deletedSubject] = await db.query(
            `DELETE FROM subjects WHERE subject_id = ?`,
            [subjectId]
        );
        if(deletedSubject.affectedRows === 0) return {error: 'Error al eliminar la materia'};
        return { message: "Materia eliminada exitosamente" }
    }
}
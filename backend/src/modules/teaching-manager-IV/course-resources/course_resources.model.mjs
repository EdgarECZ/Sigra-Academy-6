import { db } from '../../../../database/db.database.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// uploads/resources folder used by multer (one level up from course-resources)
const RESOURCES_DIR = path.resolve(__dirname, '..', 'uploads', 'resources');

export class CourseResourcesModel {
    static async create(data){
        const { assignment_id, title, resource_type, file_path_or_url, is_visible } = data;
        // Validate assignment
        const [assign] = await db.query(`SELECT * FROM teacher_assignments WHERE assignment_id = ?`, [assignment_id]);
        if(assign.length === 0) return { error: 'Asignación no encontrada.' };
        const [res] = await db.query(`INSERT INTO course_resources (assignment_id, title, resource_type, file_path_or_url, uploaded_at) VALUES (?, ?, ?, ?, NOW())`, [assignment_id, title, resource_type, file_path_or_url]);
        if(res.affectedRows === 0) return { error: 'No se pudo crear el recurso.' };
        const [inserted] = await db.query(`SELECT * FROM course_resources WHERE resource_id = ?`, [res.insertId]);
        return { message: 'Recurso creado.', resource: inserted[0] };
    }

    static async update(resourceId, data){
        if(!resourceId) return { error: 'No se proporcionó el ID del recurso.' };
        const allowed = ['title','resource_type','file_path_or_url','is_visible'];
        const fields = [];
        const values = [];
        for(const k of allowed){ if(data[k] !== undefined){ fields.push(`${k} = ?`); values.push(data[k]); }}
        if(fields.length === 0) return { error: 'No hay campos para actualizar.' };
        values.push(resourceId);
        const [res] = await db.query(`UPDATE course_resources SET ${fields.join(', ')} WHERE resource_id = ?`, values);
        if(res.affectedRows === 0) return { error: 'No se pudo actualizar el recurso.' };
        const [updated] = await db.query(`SELECT * FROM course_resources WHERE resource_id = ?`, [resourceId]);
        return { message: 'Recurso actualizado.', resource: updated[0] };
    }

    static async getByAssignment(assignmentId){
        if(!assignmentId) return { error: 'No se proporcionó el ID de la asignación.' };
        const [rows] = await db.query(`SELECT * FROM course_resources WHERE assignment_id = ? ORDER BY uploaded_at DESC`, [assignmentId]);
        if(rows.length === 0) return { message: 'No hay recursos para esta asignación.' };
        return { message: `Se encontraron ${rows.length} recursos.`, resources: rows };
    }

    static async getById(resourceId){
        if(!resourceId) return { error: 'No se proporcionó el ID del recurso.' };
        const [rows] = await db.query(`SELECT * FROM course_resources WHERE resource_id = ?`, [resourceId]);
        if(rows.length === 0) return { error: 'Recurso no encontrado.' };
        return { message: 'Recurso encontrado.', resource: rows[0] };
    }

    static async delete(resourceId){
        if(!resourceId) return { error: 'No se proporcionó el ID del recurso.' };
        const [existing] = await db.query(`SELECT * FROM course_resources WHERE resource_id = ?`, [resourceId]);
        if(existing.length === 0) return { error: 'Recurso no encontrado.' };
        // If the resource has an uploaded file in our resources folder, attempt to remove it
        let attemptedFilePath = null;
        let fileRemoved = false;
        try{
            const fileUrl = existing[0].file_path_or_url || null;
            if(fileUrl && typeof fileUrl === 'string' && fileUrl.includes('/uploads/resources/')){
                const parts = fileUrl.split('/uploads/resources/');
                const filename = parts[1];
                if(filename){
                    const filePath = path.join(RESOURCES_DIR, filename);
                    attemptedFilePath = filePath;
                    try{
                        const exists = fs.existsSync(filePath);
                        console.log('course_resources.model: attempting to remove file', { filePath, exists });
                        if(exists){ fs.unlinkSync(filePath); fileRemoved = true; console.log('course_resources.model: file removed', filePath); }
                    }catch(err){ console.warn('Could not delete resource file:', filePath, err); }
                }
            }
        }catch(pe){ console.warn('Error while trying to remove resource file:', pe); }

        const [res] = await db.query(`DELETE FROM course_resources WHERE resource_id = ?`, [resourceId]);
        if(res.affectedRows === 0) return { error: 'No se pudo eliminar el recurso.' };
        return { message: 'Recurso eliminado.', fileRemoved, attemptedFilePath };
    }
}
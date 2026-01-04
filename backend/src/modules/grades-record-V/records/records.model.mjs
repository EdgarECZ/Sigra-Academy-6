import { db } from "../../../../database/db.database.mjs";

export class AcademicRecordsModel {

    // 1. OBTENER BOLETÍN (GET)
    static async getStudentReportCard(studentId) {
        if (!studentId) return { error: 'No se proporcionó el ID del estudiante.' };

        // Verificamos que el estudiante exista
        const [student] = await db.query(
            `SELECT user_id, first_name, last_name, email FROM users WHERE user_id = ?`,
            [studentId]
        );

        if (student.length === 0) return { error: 'El estudiante no existe.' };

        // Consulta compleja para traer materias, profesores y notas
        const query = `
            SELECT 
                far.record_id,
                s.subject_name AS asignatura,
                CONCAT(u_teach.first_name, ' ', u_teach.last_name) AS docente,
                far.final_score AS nota_final,
                far.status AS estado,
                ay.name AS periodo
            FROM final_academic_records far
            JOIN teacher_assignments ta ON far.assignment_id = ta.assignment_id
            JOIN sections sec ON ta.section_id = sec.section_id
            JOIN academic_years ay ON sec.academic_year_id = ay.year_id
            JOIN subjects s ON ta.subject_id = s.subject_id
            JOIN users u_teach ON ta.teacher_user_id = u_teach.user_id
            WHERE far.student_user_id = ?
            ORDER BY ay.start_date DESC
        `;

        const [reportCard] = await db.query(query, [studentId]);

        if (reportCard.length === 0) {
            return { 
                message: 'El estudiante aún no tiene registros académicos cerrados.',
                student: student[0],
                records: [] 
            };
        }

        // Calculamos promedio simple
        const totalScore = reportCard.reduce((sum, record) => sum + Number(record.nota_final), 0);
        const globalAverage = (totalScore / reportCard.length).toFixed(2);

        return {
            message: `Boletín generado exitosamente.`,
            student: {
                ...student[0],
                global_average: globalAverage
            },
            records: reportCard
        };
    }

    // 2. CREAR REGISTRO FINAL (POST)
    static async createAcademicRecord(data) {
        const { student_user_id, assignment_id, final_score, status } = data;

        // Calculamos estatus automático si no viene en los datos
        let finalStatus = status;
        if (!finalStatus) {
            finalStatus = final_score >= 10 ? 'Aprobado' : 'Aplazado';
        }

        // Verificamos si ya existe una nota para esa materia y alumno
        const [exists] = await db.query(
            `SELECT record_id FROM final_academic_records 
             WHERE student_user_id = ? AND assignment_id = ?`,
            [student_user_id, assignment_id]
        );

        if (exists.length > 0) {
            return { error: 'El estudiante ya tiene una nota final cerrada para esta materia.' };
        }

        // Insertamos
        const [result] = await db.query(
            `INSERT INTO final_academic_records (student_user_id, assignment_id, final_score, status)
             VALUES (?, ?, ?, ?)`,
            [student_user_id, assignment_id, final_score, finalStatus]
        );

        return {
            message: 'Nota final registrada exitosamente.',
            record: { id: result.insertId, ...data, status: finalStatus }
        };
    }

    // 3. ACTUALIZAR NOTA (PATCH)
    static async updateAcademicRecord(recordId, data) {
        const fields = [];
        const values = [];

        // Construcción dinámica del SQL
        if (data.final_score !== undefined) {
            fields.push('final_score = ?');
            values.push(data.final_score);
            
            // Si cambian la nota y no dicen el estatus, lo recalculamos
            if (data.status === undefined) {
                const newStatus = data.final_score >= 10 ? 'Aprobado' : 'Aplazado';
                fields.push('status = ?');
                values.push(newStatus);
            }
        }

        if (data.status !== undefined) {
            fields.push('status = ?');
            values.push(data.status);
        }

        if (fields.length === 0) return { error: 'No hay datos para actualizar.' };

        values.push(recordId); 

        const [result] = await db.query(
            `UPDATE final_academic_records SET ${fields.join(', ')} WHERE record_id = ?`,
            values
        );

        if (result.affectedRows === 0) return { error: 'Registro no encontrado.' };

        return { message: 'Registro actualizado correctamente.' };
    }
}
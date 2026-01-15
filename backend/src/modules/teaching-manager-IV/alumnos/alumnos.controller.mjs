import { AlumnosModel } from './alumnos.model.mjs';
import { validateGetStudentsQuery, validateTeacherIdParam } from './alumnos.schema.mjs';
import ExcelJS from 'exceljs';

export class AlumnosController {
    // GET /sections/:sectionId/students
    static async getStudentsBySection(req, res){
        const { sectionId } = req.params;
        const validation = validateGetStudentsQuery(req.query);
        try{
            if(!validation.success) return res.status(400).json({ error: 'Parámetros inválidos', details: validation.error });
            const { teacherId, q, orderBy, order, limit, offset } = validation.data;
            if(!teacherId) return res.status(400).json({ error: 'Se requiere teacherId en query (ej. ?teacherId=2) para validar permisos.' });
            // validar permiso
            const allowed = await AlumnosModel.isTeacherAssignedToSection(teacherId, sectionId);
            if(!allowed) return res.status(403).json({ error: 'No autorizado: el profesor no está asignado a esta sección.' });
            const result = await AlumnosModel.getStudentsBySection(sectionId, { q, orderBy, order, limit: limit || 100, offset: offset || 0 });
            return res.status(200).json(result);
        }catch(e){
            console.error('Error en AlumnosController.getStudentsBySection:', e);
            return res.status(500).json({ error: 'Error al obtener estudiantes.' });
        }
    }

    // GET /sections/:sectionId/students/export
    static async exportStudentsBySection(req, res){
        const { sectionId } = req.params;
        const validation = validateGetStudentsQuery(req.query);
        try{
            if(!validation.success) return res.status(400).json({ error: 'Parámetros inválidos', details: validation.error });
            const { teacherId, q, orderBy, order } = validation.data;
            if(!teacherId) return res.status(400).json({ error: 'Se requiere teacherId en query para validar permisos.' });
            const allowed = await AlumnosModel.isTeacherAssignedToSection(teacherId, sectionId);
            if(!allowed) return res.status(403).json({ error: 'No autorizado: el profesor no está asignado a esta sección.' });
            const result = await AlumnosModel.getStudentsBySection(sectionId, { q, orderBy, order, limit: 100000, offset: 0 });
            const rows = result.students || [];
            const sectionName = await AlumnosModel.getSectionName(sectionId) || '';

            const filenameSafe = sectionName ? sectionName.replace(/[^a-z0-9\-_.]/gi, '_') : String(sectionId);
            const format = (req.query.format || 'csv').toLowerCase();

            // XLSX export
            if(format === 'xlsx'){
                const workbook = new ExcelJS.Workbook();
                const sheet = workbook.addWorksheet('Alumnos');
                sheet.columns = [
                    { header: 'ID', key: 'user_id', width: 10 },
                    { header: 'Nombre', key: 'nombre', width: 40 },
                    { header: 'Email', key: 'email', width: 30 },
                    { header: 'EnrollmentID', key: 'enrollment_id', width: 18 },
                    { header: 'Sección', key: 'seccion', width: 30 },
                ];

                // add rows
                rows.forEach(r => {
                    sheet.addRow({ user_id: r.user_id, nombre: r.nombre || '', email: r.email || '', enrollment_id: r.enrollment_id || '', seccion: sectionName });
                });

                // style header
                sheet.getRow(1).font = { bold: true };
                sheet.autoFilter = 'A1:E1';

                const buffer = await workbook.xlsx.writeBuffer();
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="alumnos_${filenameSafe}.xlsx"`);
                return res.status(200).send(Buffer.from(buffer));
            }

            // Fallback: Build CSV with BOM and 'Sección' column
            const BOM = '\uFEFF';
            const escapeCell = (v) => `"${String(v || '').replace(/"/g,'""')}"`;
            const headers = ['ID','Nombre','Email','EnrollmentID','Sección'];
            let csvRows = [];
            csvRows.push(headers.map(h => escapeCell(h)).join(','));
            rows.forEach(r => {
                const line = [r.user_id, r.nombre || '', r.email || '', r.enrollment_id || '', sectionName].map(c => escapeCell(c)).join(',');
                csvRows.push(line);
            });
            const csvString = BOM + csvRows.join('\r\n');

            const buf = Buffer.from(csvString, 'utf8');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="alumnos_${filenameSafe}.csv"`);
            return res.status(200).send(buf);
        }catch(e){
            console.error('Error en AlumnosController.exportStudentsBySection:', e);
            return res.status(500).json({ error: 'Error al exportar estudiantes.' });
        }
    }

    // GET /teacher/:teacherId/sections
    static async getSectionsByTeacher(req, res){
        const { teacherId } = req.params;
        const validation = validateTeacherIdParam({ teacherId });
        try{
            if(!validation.success) return res.status(400).json({ error: 'Parámetros inválidos', details: validation.error });
            const result = await AlumnosModel.getSectionsByTeacher(validation.data.teacherId);
            if(result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json(result);
        }catch(e){
            console.error('Error en AlumnosController.getSectionsByTeacher:', e);
            return res.status(500).json({ error: 'Error al obtener secciones.' });
        }
    }

    /**
     * Ensure each student is enrolled in at least perStudent sections (from ensure_enrollments.mjs)
     * @param {number} perStudent - Minimum enrollments per student
     * @param {boolean} dryRun - If true, only logs what would be done
     * @returns {Promise<object>} - Summary of assignments
     */
    static async ensureMinimumEnrollments(perStudent = 3, dryRun = false) {
        // Get role id for 'Estudiante' or 'student'
        const [roles] = await AlumnosModel.db.query(`SELECT role_id FROM roles WHERE LOWER(role_name) IN ('estudiante','student') LIMIT 1`);
        const roleId = roles[0] ? roles[0].role_id : null;
        if(!roleId) {
            const [allRoles] = await AlumnosModel.db.query(`SELECT role_id, role_name FROM roles`);
            return { error: 'No se encontró rol Estudiante o student.', roles: allRoles };
        }
        const [students] = await AlumnosModel.db.query(`SELECT user_id FROM users WHERE role_id = ?`, [roleId]);
        const [sections] = await AlumnosModel.db.query(`SELECT section_id FROM sections`);
        if(sections.length === 0) return { error: 'No se encontraron secciones en la BD.' };
        let secIdx = 0;
        let planned = 0;
        let assigned = 0;
        let skipped = 0;
        for(const s of students){
            const userId = s.user_id;
            const [en] = await AlumnosModel.db.query(`SELECT COUNT(*) as c FROM enrollments WHERE student_user_id = ?`, [userId]);
            const current = en[0] ? en[0].c : 0;
            let toAssign = perStudent - current;
            while(toAssign > 0){
                const sectionId = sections[secIdx % sections.length].section_id;
                try{
                    if(dryRun){
                        planned++;
                    } else {
                        await AlumnosModel.db.query(`INSERT IGNORE INTO enrollments (student_user_id, section_id) VALUES (?, ?)`, [userId, sectionId]);
                        assigned++;
                    }
                }catch(e){ skipped++; }
                secIdx++;
                toAssign--;
            }
        }
        return { dryRun, planned, assigned, skipped, totalStudents: students.length };
    }
}
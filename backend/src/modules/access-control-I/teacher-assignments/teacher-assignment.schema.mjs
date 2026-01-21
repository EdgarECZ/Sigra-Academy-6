// Simple validation utilities for teacher assignments
export function validateCreateAssignment(payload){
    const errors = {};
    const out = {};
    if(!payload || typeof payload !== 'object') return { success: false, error: 'Payload inválido' };
    const t = Number(payload.teacher_user_id || payload.teacherId || payload.teacher_user);
    const s = Number(payload.subject_id || payload.subjectId || payload.subject);
    const sec = Number(payload.section_id || payload.sectionId || payload.section);
    if(!t || Number.isNaN(t) || t <= 0) errors.teacher_user_id = 'teacher_user_id debe ser un entero positivo'; else out.teacher_user_id = t;
    if(!s || Number.isNaN(s) || s <= 0) errors.subject_id = 'subject_id debe ser un entero positivo'; else out.subject_id = s;
    if(!sec || Number.isNaN(sec) || sec <= 0) errors.section_id = 'section_id debe ser un entero positivo'; else out.section_id = sec;

    if(Object.keys(errors).length) return { success: false, error: errors };
    return { success: true, data: out };
}

export default { validateCreateAssignment };

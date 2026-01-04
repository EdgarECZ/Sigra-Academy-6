import { z } from 'zod';

// Esquema para validar la creación de un registro académico final (Cierre de nota)
const createRecordSchema = z.object({
    student_user_id: z.number({
        required_error: "El ID del estudiante es requerido",
        invalid_type_error: "El ID del estudiante debe ser un número"
    }).int().positive(),
    
    assignment_id: z.number({
        required_error: "El ID de la asignación (materia) es requerido"
    }).int().positive(),
    
    // Asumiendo escala 0-20 (común en Venezuela) o 0-100 según tu sistema
    final_score: z.number({
        required_error: "La nota final es requerida"
    }).min(0, "La nota mínima es 0").max(20, "La nota máxima es 20"), 

    // Opcional: El estatus puede enviarse o calcularse automáticamente
    status: z.enum(['Aprobado', 'Aplazado']).optional()
});

// Esquema para validar la actualización (por si hay que corregir una nota)
const updateRecordSchema = z.object({
    final_score: z.number().min(0).max(20).optional(),
    status: z.enum(['Aprobado', 'Aplazado']).optional()
});

export function validateCreateRecord(data) {
    return createRecordSchema.safeParse(data);
}

export function validateUpdateRecord(data) {
    return updateRecordSchema.partial().safeParse(data);
}
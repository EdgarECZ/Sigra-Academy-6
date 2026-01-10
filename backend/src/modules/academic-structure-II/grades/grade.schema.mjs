import {z} from 'zod';

// Esquema para validar la creación de un grado académico
const createGradeSchema = z.object({
    grade_name: z.string().min(1).max(100),
    level_order: z.number().int().positive(),
});

// Esquema para validar la actualización de un grado académico
export const updateGradeSchema = z.object({
    grade_name: z.string().min(1).max(100).optional(),
    level_order: z.number().int().positive().optional(),
});

// Función para validar los datos al crear un grado académico
export function validateCreateGrade(data){
    return createGradeSchema.safeParse(data);
}

// Función para validar los datos al actualizar un grado académico
export function validateUpdateGrade(data){
    return updateGradeSchema.partial().safeParse(data);
}
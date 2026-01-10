import {z} from "zod";

// Esquema de validación para la creación de una materia
const createSubjectSchema = z.object({
    grade_id: z.number().int().positive(),
    subject_name: z.string().min(1).max(100),
    code_subject: z.string().min(1).max(20),
    description: z.string().max(255).optional(),
    is_active: z.boolean().optional()
});

// Esquema de validación para la actualización de una materia
const updateSubjectSchema = z.object({
    grade_id: z.number().int().positive().optional(),
    subject_name: z.string().min(1).max(100).optional(),
    code_subject: z.string().min(1).max(20).optional(),
    description: z.string().max(255).optional(),
    is_active: z.boolean().optional()
});

// Función para validar los datos de creación de una materia
export function validateCreateSubject(data){
    return createSubjectSchema.safeParse(data);
}

// Función para validar los datos de actualización de una materia
export function validateUpdateSubject(data){
    return updateSubjectSchema.partial().safeParse(data);
}
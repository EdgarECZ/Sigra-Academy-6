import {z} from 'zod';

// Esquema de validación para la creación de una sección académica
const schemaSection = z.object({
    grade_id: z.number().int().positive(),
    academic_year_id: z.number().int().positive(),
    section_name: z.string().min(1).max(100),
    capacity: z.number().int().positive().optional()
});

// Esquema de validación para la actualización de una sección académica
const schemaUpdateSection = z.object({
    section_name: z.string().min(1).max(100).optional(),
    capacity: z.number().int().positive().optional()
});

// Función para validar los datos de creación de una sección académica
export function validateSection(data){
    return schemaSection.safeParse(data);
}

// Función para validar los datos de actualización de una sección académica
export function validateUpdateSection(data){
    return schemaUpdateSection.partial().safeParse(data);
}
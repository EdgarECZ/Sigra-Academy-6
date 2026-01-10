import {z} from 'zod';

// Esquema de validación para crear un año académico
const createYearSchema = z.object({
    name: z.string().min(1).max(100),
    start_date: z.string().refine((date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
    }).transform((date) => new Date(date)),
    end_date: z.string().refine((date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
    }).transform((date) => new Date(date))
});

// Esquema de validación para actualizar un año académico
export const updateYearSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    start_date: z.string().refine((date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
    }).transform((date) => new Date(date)).optional(),
    end_date: z.string().refine((date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
    }).transform((date) => new Date(date)).optional()
});

// Función para validar los datos al crear un año académico
export function validateCreateYear(data){
    return createYearSchema.safeParse(data);
}

// Función para validar los datos al actualizar un año académico
export function validateUpdateYear(data){
    return updateYearSchema.partial().safeParse(data);
}
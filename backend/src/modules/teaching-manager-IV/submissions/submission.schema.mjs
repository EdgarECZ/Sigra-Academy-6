import {z} from "zod";

// Esquema de validación para la creación de una entrega de una actividad
const createSubmissionSchema = z.object({
    activity_id: z.number().int().positive(),
    student_user_id: z.number().int().positive(),
    file_path: z.string().min(1).max(500),
    submission_date: z.string().refine((date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
    }).transform((date) => new Date(date)),
    comments: z.string().max(1000).optional()
});

// Esquema de validación para la actualización de una entrega de una actividad
const updateSubmissionSchema = z.object({
    file_path: z.string().min(1).max(500).optional(),
    submission_date: z.string().refine((date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
    }).transform((date) => new Date(date)).optional(),
    comments: z.string().max(1000).optional()
});

// Función para validar los datos de creación de una entrega
export function validateCreateSubmission(data) {
    return createSubmissionSchema.safeParse(data);
}

// Función para validar los datos de actualización de una entrega
export function validateUpdateSubmission(data) {
    return updateSubmissionSchema.partial().safeParse(data);
}
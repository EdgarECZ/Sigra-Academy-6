import {z} from "zod";

// Esquema de validación para la creación de una prelatura
const createPrelacySchema = z.object({
	subject_id: z.number().int().positive(),
	subject_prerequisites_id: z.number().int().positive()
});

// Función para validar los datos de creación de una prelatura
export function validateCreatePrelacy(data){
	return createPrelacySchema.safeParse(data);
}


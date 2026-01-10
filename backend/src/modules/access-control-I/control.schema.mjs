import {z} from "zod";

// Esquema de valdiación para la creación de un usuario
const createdSchemaUser = z.object({
  role_id: z.number().int().positive(),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  email: z.string().email().max(100),
  phone: z.string().min(7).max(15),
  password_hash: z.string().min(6).max(100)
});

// Esquema de validación para el inicio de sesión de un usuario
const loginSchemaUser = z.object({
  email: z.string().email().max(100),
  password_hash: z.string().min(6).max(100)
});

// Esquema de validación para la actualización de un usuario
const updateSchemaUser = z.object({
  role_id: z.number().int().positive().optional(),
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
  email: z.string().email().max(100).optional(),
  phone: z.string().min(7).max(15).optional(),
  password_hash: z.string().min(6).max(100).optional(),
  is_active: z.boolean().optional()
});

// Función para validar los datos de creación de un usuario
export function validateCreateUser(data){
  return createdSchemaUser.safeParse(data);
}

// Función para validar los datos de inicio de sesión de un usuario
export function validateLoginUser(data){
  return loginSchemaUser.safeParse(data);
}

// Función para validar los datos de actualización de un usuario
export function validateUpdateUser(data){
  return updateSchemaUser.partial().safeParse(data);
}

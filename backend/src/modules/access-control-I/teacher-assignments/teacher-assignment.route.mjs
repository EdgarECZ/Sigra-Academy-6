import { Router } from 'express'
import { TeacherAssignmentAccessController } from './teacher-assignment.controller.mjs'
import { TeacherAssignmentAccessModel } from './teacher-assignment.model.mjs'

const router = Router()
const controller = new TeacherAssignmentAccessController({ model: TeacherAssignmentAccessModel })

// Obtener todas las asignaciones de profesores (detalle materia y sección)
router.get('/teacher-assignments', controller.getAll)
// Obtener asignaciones de un profesor por user_id
router.get('/teacher-assignments/:userId', controller.getByUserId)
// Crear una nueva asignación
router.post('/teacher-assignments', controller.create)

export const teacherAssignmentAccessRoute = router

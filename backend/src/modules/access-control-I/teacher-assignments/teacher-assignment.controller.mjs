// Controlador de asignaciones de profesor para módulo 1 (access control)
import { validateCreateAssignment } from './teacher-assignment.schema.mjs'

export class TeacherAssignmentAccessController {
  constructor({ model }) {
    this.model = model
  }

  // GET /teacher-assignments
  getAll = async (_req, res) => {
    try {
      const result = await this.model.getAll()
      if (result.error) return res.status(404).json({ error: result.error })
      return res.status(200).json({ message: result.message, assignments: result.assignments })
    } catch (error) {
      return res.status(500).json({ error: `Error obteniendo asignaciones: ${error.message}` })
    }
  }

  // GET /teacher-assignments/:userId
  getByUserId = async (req, res) => {
    const { userId } = req.params
    try {
      const result = await this.model.getByUserId(userId)
      if (result.error) return res.status(404).json({ error: result.error })
      return res.status(200).json({ message: result.message, assignments: result.assignments })
    } catch (error) {
      return res.status(500).json({ error: `Error obteniendo asignaciones del profesor: ${error.message}` })
    }
  }

  // POST /teacher-assignments
  create = async (req, res) => {
    try {
      const validation = validateCreateAssignment(req.body)
      if(!validation.success) return res.status(400).json({ error: 'Datos inválidos', details: validation.error })
      const data = validation.data
      const result = await this.model.create(data)
      if (result.error) return res.status(400).json({ error: result.error })
      return res.status(201).json({ message: result.message, assignment: result.assignment })
    } catch (error) {
      return res.status(500).json({ error: `Error creando asignación: ${error.message}` })
    }
  }
}

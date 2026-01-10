import { validateCreateSubject, validateUpdateSubject } from "./subjects.schema.mjs"

export class subjectController{
    constructor({subjectModel}){
        this.model= subjectModel
    }
    // controlador para obtener todas las materias
    getAllSubjects = async(req, res) => {
        try{
            const result = await this.model.getAllSubjects()
            if (result.error) return res.status(404).json({ error:result.error })
            return res.status(200).json({
                message:result.message, 
                subjects:result.subjects
            })
        }
        catch(error){
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }

    // controlador para obtener una materia por su ID
    getSubjectById = async(req, res) => {
        const { subjectId } = req.params
        try{
            const result = await this.model.getSubjectById(subjectId)
            if(result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json({
                message: result.message,
                subject: result.subject
            });
        }
        catch(error){
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }

    // controlador para crear una materia
    createSubject = async(req, res) => {
        const validation = validateCreateSubject(req.body)
        try{
            if(!validation.success){
                return res.status(400).json({
                    error: "Datos inválidos",
                    details: validation.error
                });
            }
            const result = await this.model.createSubject(validation.data)
            return res.status(201).json({
                message: result.message,
                subject: result.subject
            });
        }
        catch(error){
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }

    // controlador para actualizar una materia
    updateSubject = async(req, res) => {
        const { subjectId } = req.params
        const validation = validateUpdateSubject(req.body)
        try{
            if(!validation.success){
                return res.status(400).json({
                    error: "Datos inválidos",
                    details: validation.error
                });
            }
            const result = await this.model.updateSubject(subjectId, validation.data)
            return res.status(200).json(result)
        }
        catch(error){
            console.error(error)
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }

    // controlador para eliminar una materia
    deleteSubject = async(req, res) => {
        const { subjectId } = req.params
        try{
            const result = await this.model.deleteSubject(subjectId)
            if(result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json({ message: result.message });
        }
        catch(error){
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }
}
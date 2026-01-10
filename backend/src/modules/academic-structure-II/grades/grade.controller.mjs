import { validateCreateGrade, validateUpdateGrade } from "./grade.schema.mjs";

// Controlador que maneja las solicitudes relacionadas con los grados académicos
export class GradeController {
    constructor({ModelGrade}){
        this.ModelGrade = ModelGrade;
    }

    // Controlador para obtener todos los grados académicos
    getAllGrades = async (req, res) => {
        try{
            const result = await this.ModelGrade.getAllGrades();
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message,
                grades: result.grades
            });
        }
        catch(error){
            console.error(error);
            return res.status(500).json({error: 'Error del servidor'});
        }
    }

    // Controlador para crear un nuevo grado académico
    createGrade = async (req, res) => {
        const validation = validateCreateGrade(req.body);
        try{
            if(!validation.success){
                return res.status(400).json({
                    error: 'Datos inválidos para crear el grado',
                    details: validation.error
                });
            }
            const result = await this.ModelGrade.createGrade(validation.data);
            if(result.error) return res.status(400).json({error: result.error});
            return res.status(201).json({
                message: result.message,
                grade: result.grade
            });
        }
        catch(error){
            return res.status(500).json({error: 'Error del servidor'});
        }
    }

    // Controlador para actualizar un grado académico
    updateGrade = async (req, res) => {
        const {gradeId} = req.params;
        const validation = validateUpdateGrade(req.body);
        try{
            if(!validation.success){
                return res.status(400).json({
                    error: 'Error de validación a la hora de crear el grado',
                    details: validation.error
                })
            }
            const result = await this.ModelGrade.updateGrade(gradeId, validation.data);
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message,
                grade: result.grade
            });
        }
        catch(error){
            return res.status(500).json({error: 'Error Interno del Servidor'});
        }
    }

    // Controlador para eliminar un grado académico
    deleteGrade = async (req, res) => {
        const {gradeId} = req.params;
        try{
            const result = await this.ModelGrade.deleteGrade(gradeId);
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message
            });
        }
        catch(error){
            return res.status(500).json({error: 'Error Interno del Servidor'});
        }
    }
}
import { validateCreateYear, validateUpdateYear } from "./year.schema.mjs";

// Controlador que maneja las solicitudes relacionadas con los años académicos
export class YearController {
    constructor({ModelYear}){
        this.ModelYear = ModelYear;
    }

    // Controlador para obtener todos los años académicos
    getAllYears = async (req, res) => {
        try{
            const result = await this.ModelYear.getAllYears();
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message,
                years: result.years
            });
        }
        catch(error){
            return res.status(500).json({error: 'Error del servidor'});
        }
    }

    // Controlador para obtener un año académico por su ID
    getYearById = async (req, res) => {
        const {yearId} = req.params;
        try{
            const result = await this.ModelYear.getYearById(yearId);
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message,
                year: result.year
            });
        }
        catch(error){
            console.error(error);
            return res.status(500).json({error: 'Error del servidor'});
        }
    }

    // Controlador para crear un nuevo año académico
    createYear = async (req, res) => {
        const validation = validateCreateYear(req.body);
        try{
            if(!validation.success){
                return res.status(400).json({
                    error: 'Datos inválidos para crear el año académico',
                    details: validation.error
                });
            }
            const result = await this.ModelYear.createYear(validation.data);
            if(result.error) return res.status(400).json({error: result.error});
            return res.status(201).json({
                message: result.message,
                year: result.year
            });
        }
        catch(error){
            return res.status(500).json({error: 'Error del servidor'});
        }
    }

    // Controlador para actualizar un año académico
    updateYear = async (req, res) => {
        const {yearId} = req.params;
        const validation = validateUpdateYear(req.body);
        try{
            if(!validation.success){
                return res.status(400).json({
                    error: 'Error de validación a la hora de actualizar el año académico',
                    details: validation.error
                })
            }
            const result = await this.ModelYear.updateYear(yearId, validation.data);
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message,
                year: result.year
            });
        }
        catch(error){
            return res.status(500).json({error: 'Error Interno del Servidor'});
        }
    }

    // Controlador para eliminar un año académico
    deleteYear = async (req, res) => {
        const {yearId} = req.params;
        try{
            const result = await this.ModelYear.deleteYear(yearId);
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message
            });
        }
        catch(error){
            return res.status(500).json({error: 'Error del servidor'});
        }
    }
}
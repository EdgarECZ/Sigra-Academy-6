import { validateCreatePrelacy } from "./prelacies.schema.mjs";
// Controlador para las prelaturas o prerelacias de las materias
export class PrelaciesController {
	constructor({ModelPrelacy}){
		this.model = ModelPrelacy;
	}

	// Controlador para obtener todas las materias (Ya existe en su respectivo modelo)
	getAllSubjects = async (req, res) => {
		try{
			const result = await this.model.getAllSubjects();
			if(result.error) return res.status(404).json({error: result.error});
			return res.status(200).json({
				message: result.message,
				subjects: result.subjects
			});
		}
		catch(error){
			return res.status(500).json({error: 'Error del servidor'});
		}
	}

	// Controlador para obtener una materia por su ID ( ya existe en su respectivo modelo)
	getSubjectById = async (req, res) => {
		const { subjectId } = req.params;
		try{
			const result = await this.model.getSubjectById(subjectId);
			if(result.error) return res.status(404).json({error: result.error});
			return res.status(200).json({
				message: result.message,
				subject: result.subject
			});
		}
		catch(error){
			return res.status(500).json({error: 'Error del servidor'});
		}
	}

	// Controlador para obtener todas las prelaturas
	getAllPrelacies = async (req, res) => {
		try{
			const result = await this.model.getAllPrelacies();
			if(result.error) return res.status(404).json({error: result.error});
			return res.status(200).json({
				message: result.message,
				prelacies: result.prelacies
			});
		}
		catch(error){
			return res.status(500).json({error: 'Error del servidor'});
		}
	}

	// Controlador para obtener las prelaturas de una materia en especifico
	getPrelaciesBySubjectId = async (req, res) => {
		const { subjectId } = req.params;
		try{
			const result = await this.model.getPrelaciesBySubjectId(subjectId);
			if(result.error) return res.status(404).json({error: result.error});
			return res.status(200).json({
				message: result.message,
				prelacies: result.prelacies
			});
		}
		catch(error){
			return res.status(500).json({error: 'Error del servidor'});
		}
	}

	// Controlador para crear una prelatura
	createPrelacy = async (req, res) => {
		const validation = validateCreatePrelacy(req.body);
		try{
			if(!validation.success){
				return res.status(400).json({
					error: 'Datos inválidos',
					details: validation.error
				})
			}
			const result = await this.model.createPrelacy(validation.data);
			if(result.error) return res.status(400).json({error: result.error});
			return res.status(201).json({
				message: result.message,
				prelacy: result.prelacy
			});
		}
		catch(error){
			return res.status(500).json({error: 'Error del servidor'});
		}
	}

	// Controlador para eliminar una prelatura
	deletePrelacy = async (req, res) => {
		const { prelacyId} = req.params;
		try{
			const result = await this.model.deletePrelacy(prelacyId);
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


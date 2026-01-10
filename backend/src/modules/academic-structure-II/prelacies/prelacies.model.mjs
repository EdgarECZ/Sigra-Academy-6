import { db } from '../../../../database/db.database.mjs';

// Modelo que interactua con la tabla subject_prerequisites de la base de datos
export class ModelPrelacy{
	// Método para obtener todas las materias
	static async getAllSubjects(){
		const [subjects] = await db.query(
			`SELECT s.*, g.grade_name, g.level_order
			FROM subjects s JOIN grades g ON s.grade_id = g.grade_id WHERE s.is_active = 1 
			ORDER BY g.level_order, s.subject_name`
		);
		if(subjects.length === 0) return {error: 'No hay materias registradas'};
		return {
			message: 'Materias obtenidas correctamente',
			subjects: subjects
		}
	}

	// Método para obtener una materia por su ID
	static async getSubjectById(subjectId){
		if(!subjectId) return {error: 'El ID de la materia es requerido'};
		const [subject] = await db.query(
			`SELECT s.*, g.grade_name, g.level_order FROM subjects s JOIN grades g ON s.grade_id = g.grade_id 
			WHERE s.subject_id = ? LIMIT 1`, [subjectId]
		);
		// Verificar si se encontró la materia
		if(subject.length === 0) return {error: 'Materia no encontrada'};
		return {
			message: 'Materia obtenida correctamente',
			subject: subject[0]
		}
	}

	// Método para obtener todos las prelaturas
	static async getAllPrelacies(){
		const [prelacies] = await db.query(
			`SELECT sp.*, s1.code_subject, s1.subject_name, 
			s2.code_subject AS prerequisite_code, s2.subject_name AS prerequisite_name
			FROM subject_prerequisites sp
			JOIN subjects s1 ON sp.subject_id = s1.subject_id
			JOIN subjects s2 ON sp.subject_prerequisites_id = s2.subject_id
			ORDER BY s1.subject_name`
		);
		if(prelacies.length === 0) return {error: 'No hay prelaturas registradas'};
		return {
			message: 'Prelaturas obtenidas correctamente',
			prelacies: prelacies
		}
	}

	// Método para obtener las prelaturas de una materia en especifico
	static async getPrelaciesBySubjectId(subjectId){
		if(!subjectId) return {error: 'El ID de la materia es requerido'};
		// Se verifica si existe la materia
		const [existingSubject] = await db.query(
			`SELECT * FROM subjects WHERE subject_id = ?`,
			[subjectId]
		);
		if(existingSubject.length === 0) return {error: 'Materia no encontrada'};
		// Si existe, se obtienen sus prelaturas
		const [prelacies] = await db.query(
			`SELECT sp.subject_id, sp.subject_prerequisites_id, s.code_subject,
			s.subject_name, g.grade_name, g.level_order FROM subject_prerequisites sp
			JOIN subjects s ON sp.subject_prerequisites_id = s.subject_id
			JOIN grades g ON s.grade_id = g.grade_id
			WHERE sp.subject_id = ? ORDER BY g.level_order, s.subject_name`,
			[subjectId]
		);
		if(prelacies.length === 0) return {error: 'No hay prelaturas registradas para esta materia'};
		return {
			message: 'Prelaturas obtenidas correctamente',
			prelacies: prelacies
		}
	}

	// Método para crear una prelatura
	static async createPrelacy(data){
		if(!data) return {error: 'El ID de la materia y el ID de la prelatura son requeridos'};
		const { subject_id, subject_prerequisites_id } = data;
		// Se verifica si existe la materia y si existe la prelatura
		const [exisitingSubject] = await db.query(
			`SELECT * FROM subjects WHERE subject_id = ?`,
			[subject_id]
		);
		const [exisitingPrerequisite] = await db.query(
			`SELECT * FROM subject_prerequisites WHERE subject_prerequisites_id = ? 
			AND subject_id = ?`,
			[subject_prerequisites_id, subject_id]
		);
		if(exisitingSubject.length === 0 || exisitingPrerequisite.length > 0){
			return {error: 'Materia no encontrada o prelatura ya existe para esta materia'};
		}
		// Si no existe, se crea la prelatura
		const [newPrelacy] = await db.query(
			`INSERT INTO subject_prerequisites (subject_id, subject_prerequisites_id)
			VALUES (?, ?)`,
			[subject_id, subject_prerequisites_id]
		);
		// Se obtiene la prelatura creada
		const [createdPrelacy] = await db.query(
			`SELECT sp.*, s1.code_subject, s1.subject_name, s2.code_subject AS prerequisite_code, s2.subject_name AS prerequisite_name
			FROM subject_prerequisites sp
			JOIN subjects s1 ON sp.subject_id = s1.subject_id
			JOIN subjects s2 ON sp.subject_prerequisites_id = s2.subject_id
			WHERE sp.id = ? LIMIT 1`,
			[newPrelacy.insertId]
		);
		if(createdPrelacy.length === 0) return {error: 'Error al crear la prelatura'};
		return {
			message: 'Prelatura creada correctamente',
			prelacy: createdPrelacy[0]
		}
	}

	// Método para eliminar una prelatura
	static async deletePrelacy(prelacyId){
		if(!prelacyId) return {error: 'El ID de la prelatura es requerido'};
		// Se verifica si existe la prelatura
		const [existingPrelacy] = await db.query(
			`SELECT * FROM subject_prerequisites WHERE id = ?`,
			[prelacyId]
		);
		if(existingPrelacy.length === 0) return {error: 'Prelatura no encontrada'};
		// Si existe, se elimina la prelatura
		const [deletedPrelacy] = await db.query(
			`DELETE FROM subject_prerequisites WHERE id = ?`,
			[prelacyId]
		);
		if(deletedPrelacy.affectedRows === 0) return {error: 'Error al eliminar la prelatura'};
		return {
			message: 'Prelatura eliminada correctamente'
		}
	}
}


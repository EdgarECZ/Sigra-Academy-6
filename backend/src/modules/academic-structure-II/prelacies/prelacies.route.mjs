import { Router } from 'express';
import { ModelPrelacy } from './prelacies.model.mjs';
import { PrelaciesController } from './prelacies.controller.mjs';

const router = Router();
const controller = new PrelaciesController({ ModelPrelacy: ModelPrelacy });

// Ruta para obtener todas las materias (Ya existe en su respectivo modelo)
router.get('/subjects', controller.getAllSubjects);
// Ruta para obtener una materia por su ID (Ya existe en su respectivo modelo)
router.get('/subjects/:subjectId', controller.getSubjectById);
// Ruta para obtener todas las prelaturas
router.get('/all', controller.getAllPrelacies);
// Ruta para obtener las prelaturas de una materia en especifico
router.get('/subjects/:subjectId/prerequisites', controller.getPrelaciesBySubjectId);
// Ruta para crear una prelatura
router.post('/create', controller.createPrelacy);
// Ruta para eliminar una prelatura
router.delete('/delete/:prelacyId', controller.deletePrelacy);

export const prelaciesRoute = router;


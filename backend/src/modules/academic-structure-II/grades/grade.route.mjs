import {Router} from 'express';
import { GradeModel } from './grade.model.mjs';
import { GradeController } from './grade.controller.mjs';

const router = Router();
const controller = new GradeController({ModelGrade: GradeModel});

// Rutas relacionadas con los grados academicos
// Ruta para obtener todos los grados academicos
router.get('/all', controller.getAllGrades);
// Ruta para crear un nuevo grado academico
router.post('/create', controller.createGrade);
// Ruta para actualizar un grado academico
router.patch('/update/:gradeId', controller.updateGrade);
// Ruta para eliminar un grado academico
router.delete('/delete/:gradeId', controller.deleteGrade);

export const GradeRoutes = router;

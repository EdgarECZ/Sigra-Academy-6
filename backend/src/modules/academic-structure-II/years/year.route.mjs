import {Router} from "express";
import { YearModel } from "./year.model.mjs";
import { YearController } from "./year.controller.mjs";

const router = Router();
const controller = new YearController({ModelYear: YearModel});

// Rutas relacionadas con los años académicos
// Ruta para obtener todos los años académicos
router.get('/all', controller.getAllYears);
// Ruta para obtener un año académico por su ID
router.get('/year/:yearId', controller.getYearById);
// Ruta para crear un nuevo año académico
router.post('/create', controller.createYear);
// Ruta para actualizar un año académico
router.patch('/update/:yearId', controller.updateYear);
// Ruta para eliminar un año académico
router.delete('/delete/:yearId', controller.deleteYear);

export const YearRoutes = router;
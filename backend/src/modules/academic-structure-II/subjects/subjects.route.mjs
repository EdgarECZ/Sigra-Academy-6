import {Router} from "express" 
import { subjectController } from "./subjects.controller.mjs"
import { subjectModel } from "./subjects.model.mjs"


const router = Router()
const controller = new subjectController({subjectModel:subjectModel})

// ruta para obtener todas las materias
router.get("/all", controller.getAllSubjects)
export const subjectRoute = router

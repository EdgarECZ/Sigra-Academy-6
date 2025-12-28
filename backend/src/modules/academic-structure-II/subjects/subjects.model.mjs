import { db } from "../../../../database/db.database.mjs";

export class subjectModel{
    // metodo para obtener todas las materias
    static async getAllSubjects(){
        const [subjects] = await db.query(
            "SELECT * FROM subjects"
        )
        if(subjects.length==0) return {error:"No se han encontrado materias"}
        return { 
            message:"Se han obtenido las materias exitosamente",
            subjects:subjects
        }
    }
}
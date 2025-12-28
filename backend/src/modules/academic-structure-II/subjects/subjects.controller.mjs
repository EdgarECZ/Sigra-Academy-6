export class subjectController{
    constructor({subjectModel}){
        this.model= subjectModel
    }
    // controlador para obtener todas las materias
    getAllSubjects = async(req, res) => {
        try{
            const result = await this.model.getAllSubjects()
            if (result.error) return res.status(404).json({
                error:result.error
            })
            return res.status(200).json({
                message:result.message, 
                subjects:result.subjects
            })
        }catch(error){

        }
    }

    
}
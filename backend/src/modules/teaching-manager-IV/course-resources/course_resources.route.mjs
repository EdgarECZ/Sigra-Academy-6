import { Router } from 'express';
import { CourseResourcesController } from './course_resources.controller.mjs';
import { CourseResourcesModel } from './course_resources.model.mjs';
import { uploadSingle, uploadAny, useResourcesUpload } from '../../../api/middlewares/multer.middleware.mjs';

const router = Router();
const controller = new CourseResourcesController({ ModelResources: CourseResourcesModel });

// Be tolerant with client file field names: accept any file field and normalize to req.file
const normalizeUploadedFile = (req, res, next) => {
	if(!req.file && req.files && req.files.length > 0){
		req.file = req.files.find(f => f.fieldname === 'file') || req.files[0];
	}
	next();
};

router.post('/resources', useResourcesUpload, uploadAny(), normalizeUploadedFile, controller.create);
router.get('/resources/assignment/:assignmentId', controller.getByAssignment);
router.get('/resources/:resourceId', controller.getById);
router.put('/resources/:resourceId', useResourcesUpload, uploadAny(), normalizeUploadedFile, controller.update);
router.delete('/resources/:resourceId', controller.delete);

export const CourseResourcesRoutes = router;
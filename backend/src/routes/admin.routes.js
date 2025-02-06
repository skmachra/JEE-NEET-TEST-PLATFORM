import { Router } from "express";
import { addQuestion, updateQuestion, deleteQuestion, getAllUsers, manageTest, getReports, getQuestions, deleteTest, updatedTest, getQuestionById } from "../controllers/admin.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middelwares.js";

const router = Router();

router.route("/questions").get(verifyJWT, verifyAdmin, getQuestions);
router.route("/question/:id").get(verifyJWT, verifyAdmin, getQuestionById);
router.route("/question").post(verifyJWT, verifyAdmin, upload.single("image"), addQuestion);
router.route("/question/:id").patch(verifyJWT, verifyAdmin, upload.single("image"), updateQuestion);
router.route("/question/:id").delete(verifyJWT, verifyAdmin, deleteQuestion);

router.route("/users").get(verifyJWT, verifyAdmin, getAllUsers);

router.route("/manage-test").post(verifyJWT, verifyAdmin, manageTest);
router.route("/manage-test/:id").patch(verifyJWT, verifyAdmin, updatedTest);
router.route("/delete-test/:id").delete(verifyJWT, verifyAdmin, deleteTest);

router.route("/reports").get(verifyJWT, verifyAdmin, getReports);

export default router;

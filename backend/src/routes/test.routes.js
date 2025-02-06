import { Router } from "express";
import { getTestDetails, submitTest, getTestHistory, getTestHistories, getTest } from "../controllers/test.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/:id").get(verifyJWT, getTestDetails);
router.route("/").get(getTest)
router.route("/:id/submit").post(verifyJWT, submitTest);

router.route("/history").get(verifyJWT, getTestHistories);
router.route("/history/:id").get(verifyJWT, getTestHistory)

export default router;

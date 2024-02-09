import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { sendMessage, allMessage } from "../controllers/messageControllers.js";

const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessage);

export default router;

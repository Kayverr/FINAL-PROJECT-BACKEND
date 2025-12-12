import express from "express";
import * as notice from "../controllers/DeactNoticeController.js";

const noticeroutes = express.Router();

// Overdue users
noticeroutes.get("/overdue", notice.fetchOverdueUsers);

// Admin sends notice
noticeroutes.post("/send", notice.sendDeactNoticeController);

// Mark as read
noticeroutes.put("/read/:id", notice.readNotice);

// User fetch notices
noticeroutes.get("/user/:user_id", notice.fetchNoticesForUser);

export default noticeroutes;

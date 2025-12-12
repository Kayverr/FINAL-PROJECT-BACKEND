import express from "express";
import * as receipt from "../controllers/ReceiptController.js";

const receiptroutes = express.Router();

// GET /receipt/:consumption_id
receiptroutes.get("/:consumption_id", receipt.generateReceipt);

export default receiptroutes;

import pool from "../config/db.js";

// Helper: calculate bill based on cubic used
const calculateBill = (cubicUsed) => {
  if (cubicUsed <= 5) return 270;
  return 270 + (cubicUsed - 5) * 17;
};
import pool from "../config/db.js";

// Get a confirmed payment for a specific user & billing
export const getConsumptionForReceipt = async (consumptionId) => {
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE id = ?",
    [consumptionId]
  );
  if (!rows.length) throw new Error("Consumption not found.");
  return rows[0];
};

//Save generated receipt
export const saveReceipt = async ({ user_id, consumption_id, payment_amount, receipt_number }) => {
  const [result] = await pool.query(
    `INSERT INTO receipts (user_id, consumption_id, payment_amount, receipt_number)
     VALUES (?, ?, ?, ?)`,
    [user_id, consumption_id, payment_amount, receipt_number]
  );
  return result.insertId;
};

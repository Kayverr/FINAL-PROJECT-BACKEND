import pool from "../config/db.js";

// Helper: calculate bill based on cubic used
const calculateBill = (cubicUsed) => {
  if (cubicUsed <= 5) return 270;
  return 270 + (cubicUsed - 5) * 17;
};


//ARCHIVE OLD RECORDS (OLDER THAN 5 YEARS)
export const archiveOldConsumptions = async () => {
  await pool.query(
    `INSERT INTO water_consumption_archive 
     (user_id, name, previous_reading, present_reading, cubic_used, cubic_used_last_month,
      current_bill, total_bill, payment_1, payment_2, remaining_balance, billing_date, due_date, archived_at)
     SELECT user_id, name, previous_reading, present_reading, cubic_used, cubic_used_last_month,
            current_bill, total_bill, payment_1, payment_2, remaining_balance, billing_date, due_date, NOW()
     FROM water_consumption
     WHERE billing_date < DATE_SUB(CURDATE(), INTERVAL 5 YEAR)`
  );

  // Delete old records from main table
  const [result] = await pool.query(
    "DELETE FROM water_consumption WHERE billing_date < DATE_SUB(CURDATE(), INTERVAL 5 YEAR)"
  );

  // Reset AUTO_INCREMENT so new inserts don’t conflict
  await pool.query(
    "ALTER TABLE water_consumption AUTO_INCREMENT = 1"
  );

  return result.affectedRows;
};

// CREATE NEW CONSUMPTION
export const createConsumption = async (data) => {
  const { user_id, name, cubic_used } = data;

  if (!user_id || !name || cubic_used === undefined) {
    const error = new Error("Missing required fields.");
    error.statusCode = 400;
    throw error;
  }
  // Automatically archive old records
  await archiveOldConsumptions();

  const today = new Date();

  // Check if user already has a record for this month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [existing] = await pool.query(
    "SELECT * FROM water_consumption WHERE user_id = ? AND billing_date BETWEEN ? AND ?",
    [user_id, monthStart, monthEnd]
  );

  if (existing.length > 0) {
    const error = new Error("Consumption for this month has already been recorded.");
    error.statusCode = 400;
    throw error;
  }

  // Get last record to calculate previous readings
  const [last] = await pool.query(
    "SELECT present_reading, cubic_used FROM water_consumption WHERE user_id = ? ORDER BY billing_date DESC LIMIT 1",
    [user_id]
  );

  const previous_reading = last.length ? last[0].present_reading : 0;
  const cubic_used_last_month = last.length ? last[0].cubic_used : 0;

  const current_bill = calculateBill(cubic_used);
  const total_bill = current_bill;

  const billing_date = today; // keep current date

  // Due date: first day of next month
  const due_date = new Date(today);
  due_date.setMonth(due_date.getMonth() + 1);
  due_date.setDate(1);

  // Insert new consumption record
  const [result] = await pool.query(
    `INSERT INTO water_consumption
      (user_id, name, previous_reading, present_reading, cubic_used, cubic_used_last_month,
       current_bill, total_bill, payment_1, payment_2, remaining_balance, billing_date, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      name,
      previous_reading,
      current_bill,
      cubic_used,
      cubic_used_last_month,
      current_bill,
      total_bill,
      0,
      0,
      total_bill,
      billing_date,
      due_date,
    ]
  );

  // Return newly inserted record
  const [newRow] = await pool.query(
    "SELECT * FROM water_consumption WHERE id = ?",
    [result.insertId]
  );

  return newRow[0];
};

// GET ALL LATEST CONSUMPTIONS PER USER (FOR DASHBOARD)
export const getAllConsumptions = async () => {
  const [rows] = await pool.query(`
    SELECT w1.*
    FROM water_consumption w1
    INNER JOIN (
      SELECT user_id, MAX(billing_date) AS latest_billing
      FROM water_consumption
      GROUP BY user_id
    ) w2 ON w1.user_id = w2.user_id AND w1.billing_date = w2.latest_billing
    ORDER BY w1.user_id
  `);
  return rows;
};

// GET CONSUMPTION BY ID
export const getConsumptionById = async (id) => {
  if (isNaN(id)) throw new Error("Invalid ID.");
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE id = ?",
    [id]
  );
  if (rows.length === 0) throw new Error("Consumption record not found.");
  return rows[0];
};

// GET ALL CONSUMPTIONS FOR A USER
export const getConsumptionsByUser = async (user_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM water_consumption WHERE user_id = ? ORDER BY created_at DESC",
    [user_id]
  );
  return rows;
};

export const getUserName = async (user_id) => {
  const [rows] = await pool.query(
    "SELECT name FROM water_consumption WHERE user_id = ? LIMIT 1",
    [user_id]
  );
  return rows[0]?.name || "Unknown User";
};

// /* -------------------------------
//    UPDATE CONSUMPTION
// --------------------------------*/
// export const updateConsumption = async (id, data) => {
//   const { cubic_used, payment_1, payment_2 } = data;
//   const old = await getConsumptionById(id);

//   // Only update cubic_used if provided
//   const newCubicUsed = cubic_used ?? old.cubic_used;
//   const current_bill = calculateBill(newCubicUsed);
//   const total_bill = current_bill;

//   // Handle payments
//   let newPayment1 = old.payment_1;
//   let newPayment2 = old.payment_2;
//   let remaining = total_bill - newPayment1 - newPayment2;

//   if (payment_1 !== undefined && old.payment_2 === 0) {
//     newPayment1 = payment_1;
//     remaining = total_bill - newPayment1 - newPayment2;
//   }

//   if (payment_2 !== undefined) {
//     newPayment2 = payment_2;
//     remaining = total_bill - newPayment1 - newPayment2;
//   }

//   await pool.query(
//     `UPDATE water_consumption SET
//        cubic_used = ?,
//        current_bill = ?,
//        total_bill = ?,
//        payment_1 = ?,
//        payment_2 = ?,
//        remaining_balance = ?
//      WHERE id = ?`,
//     [newCubicUsed, current_bill, total_bill, newPayment1, newPayment2, remaining, id]
//   );

//   return await getConsumptionById(id);
// };

// // DELETE CONSUMPTION
// export const deleteConsumption = async (id) => {
//   const [result] = await pool.query(
//     "DELETE FROM water_consumption WHERE id = ?",
//     [id]
//   );
//   if (result.affectedRows === 0) throw new Error("Record not found.");
//   return true;
// };

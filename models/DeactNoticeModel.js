import pool from "../config/db.js";

// Fetch overdue users: remaining_balance > 0 AND 3 days before due_date
export const getOverdueUsers = async () => {
  const [rows] = await pool.query(
    `SELECT user_id, name, remaining_balance, billing_date, due_date
     FROM water_consumption
     WHERE remaining_balance > 0
       AND (
         -- Previous month (handles Jan correctly)
         (MONTH(due_date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
          AND YEAR(due_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
          AND CURDATE() >= DATE_SUB(due_date, INTERVAL 3 DAY))
         OR
         -- Current month
         (MONTH(due_date) = MONTH(CURDATE())
          AND YEAR(due_date) = YEAR(CURDATE())
          AND CURDATE() >= DATE_SUB(due_date, INTERVAL 3 DAY))
       )
     GROUP BY user_id`
  );
  return rows;
};


// Create deactivation notice with auto-message
export const createDeactNotice = async ({ user_id, name, due_date, remaining_balance }) => {
  const title = "Payment Overdue";
  const message = `Dear ${name}, our records show that you still have an unpaid balance of ₱${remaining_balance}. Please settle your payment before ${new Date(due_date).toLocaleDateString()} to avoid service interruption.`;

  const [result] = await pool.query(
  `INSERT INTO notifications (user_id, title, message, created_at)
   VALUES (?, ?, ?, NOW())`,
  [user_id, title, message]
);

  return {
    id: result.insertId,
    user_id,
    title,
    message,
    created_at: new Date(),
  };
};

// Mark notice as read
export const markNoticeAsRead = async (id) => {
  await pool.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id]);
  return true;
};

// Get user notifications
export const getUserNotices = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT *
     FROM notifications
     WHERE user_id = ? OR user_id IS NULL
     ORDER BY created_at DESC`,
    [user_id]
  );
  return rows;
};

// Check if a notice already exists for the current month
export const hasDeactNotice = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count
     FROM notifications
     WHERE user_id = ?
       AND title = 'Payment Overdue'
       AND MONTH(created_at) = MONTH(CURDATE())
       AND YEAR(created_at) = YEAR(CURDATE())`,
    [user_id]
  );
  return rows[0].count > 0;
};


// Fetch latest user billing info
export const getLatestUserBill = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT name, due_date, remaining_balance
     FROM water_consumption
     WHERE user_id = ?
     ORDER BY billing_date DESC
     LIMIT 1`,
    [user_id]
  );
  return rows[0] || null;
};

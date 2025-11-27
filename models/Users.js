import pool from "../config/db.js";
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

export const getuser = async () => {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
};

export const createUser = async (username, password, name) => {
    if (username.trim() === '' || password.trim() === '' || name.trim() === '') {
        const error = new TypeError('Name, Username, and Password are required fields.');
        error.statusCode = 400;
        throw error;
    }

    if (!validator.isStrongPassword(password)) {
        const error = new TypeError('Password is not strong enough.');
        error.statusCode = 400;
        throw error;
    }

    const [user] = await pool.query(
        "SELECT username FROM users WHERE username = ?", [username]
    );

    if (user.length === 1) {
        const error = new TypeError(`The username ${username} is already in use.`);
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    const [newUser] = await pool.query(
        "INSERT INTO users (username, password, name) VALUES (?, ?, ?)",
        [username, hashedPassword, name]
    );

    return newUser;
};

export const login = async (username, password) => {
    if (username.trim() === '' || password.trim() === '') {
        const error = new Error('username and password is required');
        error.statusCode = 400;
        throw error;
    }

    const [user] = await pool.query(
        "SELECT * FROM users WHERE username = ?", [username]
    );

    if (user.length === 0) {
        const error = new Error(`Account with username: ${username} does not exist.`);
        error.statusCode = 400;
        throw error;
    }

    if (!bcrypt.compareSync(password, user[0].password)) {
        const error = new Error('Incorrect password.');
        error.statusCode = 400;
        throw error;
    }

    const token = jwt.sign(
        { id: user[0].id },
        process.env.SECRET,
        { expiresIn: '1d' }
    );

    return {
        success: true,
        token: token,
        role: user[0].role,
        name: user[0].name,
        id: user[0].id
    };
};

export const getUser = async (id) => {
    if (isNaN(parseInt(id))) {
        throw new Error("Invalid id");
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

    if (rows.length === 0) throw new Error("User not found");

    return rows[0];
};

export const removeUser = async (id) => {
    const [result] = await pool.query(
        "DELETE FROM users WHERE id = ?",
        [id]
    );
    return result.affectedRows;
};

// export const updateuser = async (username, password, id) => {
//     const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

//     const [result] = await pool.query(
//         "UPDATE users SET username = ?, password = ? WHERE id = ?",
//         [username, hashedPassword, id]
//     );
//     return result.affectedRows;
// };
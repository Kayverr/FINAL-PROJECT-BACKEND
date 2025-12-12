import pool from "../config/db.js";
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

export const getuser = async () => {
    const [rows] = await pool.query("SELECT * FROM admin_reader");
    return rows;
};

export const createUser = async (username, password) => {
    if (username.trim() === '' || password.trim() === '') {
        const error = new TypeError('Username, and Password are required fields.');
        error.statusCode = 400;
        throw error;
    }

    if (!validator.isStrongPassword(password)) {
        const error = new TypeError('Password is not strong enough.');
        error.statusCode = 400;
        throw error;
    }

    const [adminreader] = await pool.query(
        "SELECT username FROM users WHERE username = ?", [username]
    );

    if (adminreader.length === 1) {
        const error = new TypeError(`The username ${username} is already in use.`);
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    const [newUser] = await pool.query(
        "INSERT INTO admin_reader (username, password) VALUES (?, ?)",
        [username, hashedPassword]
    );

    return newUser;
};

export const login = async (username, password) => {
    if (username.trim() === '' || password.trim() === '') {
        const error = new Error('username and password is required');
        error.statusCode = 400;
        throw error;
    }

    const [adminreader] = await pool.query(
        "SELECT * FROM admin_reader WHERE username = ?", [username]
    );

    if (adminreader.length === 0) {
        const error = new Error(`Account with username: ${username} does not exist.`);
        error.statusCode = 400;
        throw error;
    }

    if (!bcrypt.compareSync(password, adminreader[0].password)) {
        const error = new Error('Incorrect password.');
        error.statusCode = 400;
        throw error;
    }

    const token = jwt.sign(
        { id: adminreader[0].id },
        process.env.SECRET,
        { expiresIn: '1d' }
    );

    return {
        success: true,
        token: token,
        role: adminreader[0].role,
        name: adminreader[0].name,
        id: adminreader[0].id
    };
};

export const getUser = async (id) => {
    if (isNaN(parseInt(id))) {
        throw new Error("Invalid id");
    }

    const [rows] = await pool.query("SELECT * FROM admin_reader WHERE id = ?", [id]);

    if (rows.length === 0) throw new Error("User not found");

    return rows[0];
};

import * as user from "../controllers/UsersControllers.js";
import express from "express";

const userRoutes = express.Router();

userRoutes.get('/all', user.fetchuser);

userRoutes.post('/register', user.Register);

userRoutes.post('/login', user.userLogin);

userRoutes.delete('/delete/:id', user.removeUser);



export default userRoutes;
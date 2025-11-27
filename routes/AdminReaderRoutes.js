import * as adminreader from "../controllers/AdminReaderControllers.js";
import express from "express";

const adminreaderRoutes = express.Router();

adminreaderRoutes.get('/alladminreader', adminreader.Getall);

adminreaderRoutes.post('/registeradminreader', adminreader.Register);

adminreaderRoutes.post('/loginadminreader', adminreader.userLogin);

export default adminreaderRoutes;
import express from 'express';
import 'dotenv/config.js';
import cors from 'cors';
import dotenv from "dotenv";
import userRoutes from './routes/UserRoutes.js';
import adminreaderRoutes from './routes/AdminReaderRoutes.js';
import consumptionRoutes from './routes/ConsumptionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();
dotenv.config();

let corsOptions = {
  origin: "http://localhost:5173",
};

app.use(cors());
app.use(express.json());
app.use(cors(corsOptions));

try {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Listening to port ${process.env.PORT || 3000}...`);
    });
}catch (e) {
    console.log(e);
}

app.use('/user', userRoutes);

app.use('/adminreader', adminreaderRoutes);

app.use('/consumption', consumptionRoutes); 

app.use('/payment', paymentRoutes);
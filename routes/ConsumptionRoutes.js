import express from "express";
import * as consumption from "../controllers/ConsumptionController.js";

const consumptionroutes = express.Router();

// Get latest consumption per user (dashboard)
consumptionroutes.get("/all", consumption.getAllConsumptions);

// Get a specific consumption by ID
consumptionroutes.get("/:id", consumption.getConsumption);

// Add new consumption record (new month)
consumptionroutes.post("/add", consumption.addConsumption);

// Delete a consumption record
consumptionroutes.delete("/delete/:id", consumption.removeConsumption);

// Get all consumptions for a specific user
consumptionroutes.get("/user/:userId", consumption.getConsumptionsByUser); 

// Archive old records manually
consumptionroutes.post("/archive-old", consumption.archiveOldConsumptions);


// Update existing consumption (payments/cubic_used adjustments)
// router.patch("/update/:id", updateConsumption);

export default consumptionroutes;

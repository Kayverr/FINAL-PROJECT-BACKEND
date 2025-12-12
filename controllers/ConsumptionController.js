import * as consumptionModel from "../models/ConsumptionModel.js";


// GET LATEST CONSUMPTIONS PER USER (DASHBOARD)
export const getAllConsumptions = async (req, res, next) => {
  try {
    const rows = await consumptionModel.getAllConsumptions(); // latest per user
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// GET A SPECIFIC CONSUMPTION BY ID
export const getConsumption = async (req, res, next) => {
  try {
    const data = await consumptionModel.getConsumptionById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// CREATE NEW CONSUMPTION RECORD
export const addConsumption = async (req, res, next) => {
  try {
    const data = await consumptionModel.createConsumption(req.body);
    res.status(201).json({
      success: true,
      data,
      message: "Consumption added successfully",
    });
  } catch (err) {
    next(err);
  }
};

/* -------------------------------
   DELETE A CONSUMPTION RECORD
--------------------------------*/
export const removeConsumption = async (req, res, next) => {
  try {
    await consumptionModel.deleteConsumption(req.params.id);
    res.json({ success: true, message: "Consumption record deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/* -------------------------------
   GET ALL CONSUMPTIONS FOR A USER
--------------------------------*/
export const getConsumptionsByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const rows = await consumptionModel.getConsumptionsByUser(userId);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// MANUALLY ARCHIVE OLD RECORDS (OLDER THAN 5 YEARS)
export const archiveOldConsumptions = async (req, res, next) => {
  try {
    const count = await consumptionModel.archiveOldConsumptions();
    res.json({ success: true, message: `${count} old records archived.` });
  } catch (err) {
    next(err);
  }
};

// UPDATE EXISTING CONSUMPTION
// export const updateConsumption = async (req, res, next) => {
//   try {
//     const data = await consumptionModel.updateConsumption(req.params.id, req.body);
//     res.json({
//       success: true,
//       data,
//       message: "Consumption updated successfully",
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const express = require("express");
const cors = require("cors");
const camera = require("../controllers/camera");
const summary = require("../controllers/summary");
const chart = require("../controllers/chart");
const prediction = require("../controllers/prediction");

const router = express.Router();

router.all("*", cors());

router.get("/api/camera/:id?", camera.get);
router.get("/api/camera/:id?/summary/:when", summary.getCurrentTotalCount);
router.get("/api/community-summary/:when", summary.getCommunitySummary);
router.get("/api/camera/:id?/chart/today", chart.getHourlyTrendOverToday);
router.get("/api/camera/:id?/chart/past-week", chart.getDailyTrendOverPastWeek);
router.get(
  "/api/camera/:id?/chart/past-month",
  chart.getDailyTrendOverPastMonth
);
router.get("/api/camera/:id/prediction", prediction.get);

module.exports = router;

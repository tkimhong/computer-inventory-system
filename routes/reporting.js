const router = require("express").Router();
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const Item = require("../models/Item");
const Transaction = require("../models/Transaction");

// GET /reports - Dashboard with links to all reports
router.get("/", auth, rbac("Admin"), async (req, res) => {
  try {
    const totalItems = await Item.countDocuments({ isDeleted: false });
    const deployedItems = await Item.countDocuments({ isDeleted: false, status: "In-Use" });
    
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    const agingItems = await Item.countDocuments({ isDeleted: false, dateAcquired: { $lte: threeYearsAgo } });

    res.render("reports/index", {
      title: "Reports",
      stats: {
        totalItems,
        deployedItems,
        agingItems,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { 
      title: "Error", 
      message: "Failed to load reports dashboard" 
    });
  }
});

// GET /reports/inventory - Inventory Status Report
router.get("/inventory", auth, rbac("Admin"), async (req, res) => {
  try {
    const allItems = await Item.find({ isDeleted: false }).lean();
    const inUseItems = await Item.find({ isDeleted: false, status: "In-Use" }).lean();
    const availableItems = await Item.find({ isDeleted: false, status: "Available" }).lean();
    const maintenanceItems = await Item.find({ isDeleted: false, status: "Maintenance" }).lean();

    const total = allItems.length;
    const deployed = inUseItems.length;
    const available = availableItems.length;
    const maintenance = maintenanceItems.length;
    const deploymentRate = total > 0 ? ((deployed / total) * 100).toFixed(2) : 0;

    res.render("reports/inventory", {
      title: "Inventory Status Report",
      stats: {
        total,
        deployed,
        available,
        maintenance,
        deploymentRate,
      },
      items: allItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { 
      title: "Error", 
      message: "Failed to load inventory report" 
    });
  }
});

// GET /reports/aging - Asset Aging Report (older than 3 years)
router.get("/aging", auth, rbac("Admin"), async (req, res) => {
  try {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const agingItems = await Item.find({
      isDeleted: false,
      dateAcquired: { $lte: threeYearsAgo },
    })
      .sort({ dateAcquired: 1 })
      .lean();

    const ageBreakdown = {
      threeToFive: agingItems.filter(
        (item) =>
          item.dateAcquired <= threeYearsAgo &&
          item.dateAcquired > new Date(threeYearsAgo.getFullYear() - 5, threeYearsAgo.getMonth(), threeYearsAgo.getDate())
      ).length,
      fiveToSeven: agingItems.filter(
        (item) =>
          item.dateAcquired <=
            new Date(threeYearsAgo.getFullYear() - 5, threeYearsAgo.getMonth(), threeYearsAgo.getDate()) &&
          item.dateAcquired >
            new Date(threeYearsAgo.getFullYear() - 7, threeYearsAgo.getMonth(), threeYearsAgo.getDate())
      ).length,
      sevenPlus: agingItems.filter(
        (item) =>
          item.dateAcquired <=
          new Date(threeYearsAgo.getFullYear() - 7, threeYearsAgo.getMonth(), threeYearsAgo.getDate())
      ).length,
    };

    res.render("reports/aging", {
      title: "Asset Aging Report",
      items: agingItems,
      count: agingItems.length,
      breakdown: ageBreakdown,
      threeYearsAgoDate: threeYearsAgo.toLocaleDateString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { 
      title: "Error", 
      message: "Failed to load aging report" 
    });
  }
});

module.exports = router;


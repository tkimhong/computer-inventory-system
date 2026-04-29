const router = require("express").Router();
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const ApiKey = require("../models/ApiKey");

router.get("/", auth, rbac("Admin"), async (req, res) => {
  try {
    const keys = await ApiKey.find({ isActive: true })
      .select("-hashedKey")
      .populate("createdBy", "username")
      .lean();

    res.render("keys/index", { keys, title: "API Key Management" });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", message: "Failed to load API keys" });
  }
});

module.exports = router;
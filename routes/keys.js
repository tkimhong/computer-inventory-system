const router = require("express").Router();
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const keyController = require("../controllers/keyController");

router.post("/", auth, rbac("Admin"), keyController.createKey);
router.get("/", auth, rbac("Admin"), keyController.listKeys);
router.delete("/:id", auth, rbac("Admin"), keyController.revokeKey);

module.exports = router;

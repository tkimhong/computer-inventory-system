const router = require("express").Router();
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const userController = require("../controllers/userController");

router.post("/", auth, rbac("Admin"), userController.createUser);
router.patch("/:id/role", auth, rbac("Admin"), userController.updateRole);
router.patch("/:id/status", auth, rbac("Admin"), userController.updateStatus);

module.exports = router;

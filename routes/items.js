const router = require("express").Router();
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const apiKey = require("../middleware/apiKey");
const itemController = require("../controllers/itemController");

const authOrApiKey = (req, res, next) => {
  if (req.headers["x-api-key"]) return apiKey(req, res, next);
  return auth(req, res, next);
};

router.get("/", authOrApiKey, itemController.listItems);
router.get("/:id/history", auth, itemController.getHistory);
router.post("/", auth, itemController.createItem);
router.put("/:id", auth, itemController.updateItem);
router.delete("/:id", auth, rbac("Admin"), itemController.deleteItem);

module.exports = router;

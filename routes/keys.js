const router = require("express").Router();
const crypto = require("crypto");
const ApiKey = require("../models/ApiKey");
const auth = require("../middleware/auth");
const rbac = require('../middleware/rbac')


// POST /api/keys to generate API Key 
router.post("/", auth, rbac('Admin'), async (req, res) => {
  try{
    const {label} = req.body;
    const rawKey = "sk_" + crypto.randomBytes(24).toString("hex");
    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.substring(0, 10);
    // console.log(req.user)
    await ApiKey.create({
      label,
      hashedKey,
      keyPrefix,
      isActive: req.user.isActive, 
      createdBy: req.user.id
    });

    res.status(201).json({message: "API Key Created, PLEASE COPY THIS, IT SHOWS ONLY ONCE HERE!", rawKey});
  }catch(err){
    res.status(404).json({error: err.message});
  }

});

router.get("/", auth, rbac('Admin'), async (req, res) => {
  const keys = await ApiKey.find ({isActive: true})
  .select("-hashedKey")
  // .populate("createdBy", "name, email")
  .lean();

  res.json(keys)
})

router.delete("/:id", auth, rbac('Admin'), async (req, res) => {
  const key = await ApiKey.findByIdAndUpdate(req.params.id, {isActive: false}, {new: true});

  if(!key){
    return res.status(404).json({error: "key not found!"});
  }

  res.json({message: "Key revoked!!"});
})



module.exports = router;

const router = require("express").Router();
const crypto = require("crypto");
const ApiKey = require("../models/ApiKey");
const auth = require("../middleware/auth");
const admin = require("../middleware/rbac");


// POST /api/keys to generate API Key 
router.post("/", async (req, res) => {
  try{
    const {label} = req.body;
    const rawKey = "sk_" + crypto.randomBytes(24).toString("hex");
    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.substring(0, 10);
    
    await ApiKey.create({
      label,
      hashedKey,
      keyPrefix,
      isActive: true, //replace with req.user.isActive
      createdBy: "507f1f77bcf86cd799439011" //req.user._id
    });

    res.status(201).json({message: "API Key Created, PLEASE COPY THIS, IT SHOWS ONLY ONCE HERE!", rawKey});
  }catch(err){
    res.status(404).json({error: err.message});
  }

});
// get the label from the body
// generate rawKey = "sk_" + using cryto.randomBytes().toString(hex)
// keyhash for strong in db using cryptotocreatehash(sha256).inputrawkey.diegest(hex)
// keyprefix = with the first 10 of rawkey
// create createdby: use user._id
// show the rawkey 201


// find all isActive: true keys, store in keys
// .populate("createdBy", "name email").lean
router.get("/", async (req, res) => {
  const keys = await ApiKey.find ({isActive: true})
  .select("-hashedKey")
  // .populate("createdBy", "name, email")
  .lean();

  res.json(keys)
})

router.patch("/:id", async (req, res) => {
  const key = await ApiKey.findByIdAndUpdate(req.params.id, {isActive: false}, {new: true});

  if(!key){
    return res.status(404).json({error: "key not found!"});
  }

  res.json({message: "Key revoked!!"});
})



module.exports = router;

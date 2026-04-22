const User = require("../models/User");
const bcrypt = require("bcryptjs");
const ApiKey = require('../models/ApiKey');

const router = require("express").Router();

// POST /api/users
router.post("/", async (req, res) => {
  // response.json({ message: "អាឆ្កែវត្ថ" });
  const {username, password, role, isActive} = req.body;

  try{
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create ({username, password:hashed, role, isActive});
    res.status(201).json({message: 'User is created', user});
  }catch(err){
    console.log(err.message);
    res.status(404).json(err.message);
  }

});



// create obj 

// try 

// {hashed bcrypt.hash (what, 10)

// create user}

// status(201).json({mess})

// catch (err){}



// patch /:id/role 
// take the role from body
// check the role if its valid, else 400 json error
// const user = findByIdAndUpdate (the id from param, {what to updare}, {new: true})
// res.json


router.patch("/:id/role", async (req, res) => {
  const {role} = req.body;

  if (!["Admin", "Technician"].includes(role)){
    return res.status(400).json({error: "Invalid role"})
  };
  const user = await User.findByIdAndUpdate(req.params.id, {role}, {new: true});
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ message: "Role Updated", user });

})

router.patch("/:id/status", async (req, res) => {
  const {isActive} = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, {isActive}, {new: true});

  if(!isActive){
    await ApiKey.updateMany(
      {createdBy: user._id}, {isActive: false}
    )
  }

 res.json({
  message: `User ${user.username} is disabled`,
});

})



module.exports = router;
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiKey = require("../models/ApiKey");

exports.createUser = async (req, res) => {
  const { username, password, role, isActive } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashed,
      role,
      isActive,
    });
    const { password: _, ...safeUser } = user.toObject();
    res.status(201).json({ message: "User is created", user: safeUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateRole = async (req, res) => {
  const { role } = req.body;

  if (!["Admin", "Technician"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true },
  );
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ message: "Role updated", user });
};

exports.updateStatus = async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true },
  );
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!isActive) {
    await ApiKey.updateMany({ createdBy: user._id }, { isActive: false });
  }

  res.json({
    message: `User ${user.username} is ${isActive ? "enabled" : "disabled"}`,
  });
};

const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

router.get("/", (request, response) => {
  response.render("auth/login", { title: "Login" });
});

router.post("/", async (request, response) => {
  const { username, password } = request.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !user.isActive) {
      return response.render("auth/login", {
        title: "Login",
        error: "Invalid credentials",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return response.render("auth/login", {
        title: "Login",
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    response.cookie("jwt", token, { httpOnly: true });
    response.redirect("/items");
  } catch (error) {
    response.render("auth/login", {
      title: "Login",
      error: "Something went wrong",
    });
  }
});

router.get("/logout", (request, response) => {
  response.clearCookie("jwt");
  response.redirect("/login");
});

module.exports = router;

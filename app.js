require("dotenv").config();
const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const limiter = require("./middleware/rateLimiter");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const itemRoutes = require("./routes/items");
const transactionRoutes = require("./routes/transactions");
const keyRoutes = require("./routes/keys");
const inventoryRoutes = require("./routes/inventory");
const authUiRoutes = require("./routes/auth_ui");
const usersUiRoutes = require("./routes/users_ui");
const keysUiRoutes = require("./routes/keys_ui");

const app = express();

// Connect to MongoDB
connectDB();

// Handlebars
app.engine("hbs", engine({
  defaultLayout: "main",
  extname: ".hbs",
  helpers: {
    eq: (a, b) => a === b,
    formatDate: (date) => date ? new Date(date).toLocaleDateString() : "",
  }
}));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:3000" }));
app.use(limiter);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/", (req, res) => {
  const token = req.cookies?.jwt;
  if (token) return res.redirect("/items");
  res.redirect("/login");
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/keys", keyRoutes);
app.use("/items", inventoryRoutes);
app.use("/login", authUiRoutes);
app.use("/logout", authUiRoutes);
app.use("/transactions", transactionRoutes);
app.use("/users", usersUiRoutes);
app.use("/keys", keysUiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`),
);

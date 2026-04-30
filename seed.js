require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const SEED_USERNAME = process.env.SEED_USERNAME || "admin";
const SEED_PASSWORD = process.env.SEED_PASSWORD || "admin1234";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ username: SEED_USERNAME });
  if (existing) {
    console.log(`User "${SEED_USERNAME}" already exists — skipping.`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(SEED_PASSWORD, 10);
  await User.create({
    username: SEED_USERNAME,
    password: hashed,
    role: "Admin",
  });

  console.log(
    `Admin user created — username: ${SEED_USERNAME}, password: ${SEED_PASSWORD}`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});

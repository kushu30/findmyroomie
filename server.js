require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

/* =========================
   ENV VALIDATION
========================= */
const PORT = process.env.PORT;
const mongoURI = process.env.MONGODB_URI;

if (!PORT) {
  console.error("❌ PORT missing from environment");
  process.exit(1);
}

if (!mongoURI) {
  console.error("❌ MONGODB_URI missing from environment");
  process.exit(1);
}

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
  origin: ["https://srmfindmyroomie.vercel.app"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 200
}));
app.options("*", cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* =========================
   DATABASE
========================= */
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
  });

/* =========================
   SCHEMA
========================= */
const roommateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "Invalid email"]
  },
  branch: { type: String, required: true, trim: true, uppercase: true },
  hostelType: { type: String, required: true, trim: true, lowercase: true },
  hostel: { type: String, required: true, trim: true },
  room: { type: String, required: true, trim: true },
  instagram: { type: String, trim: true, default: "" },
  registeredAt: { type: Date, default: Date.now }
});

roommateSchema.index({ email: 1, hostel: 1, room: 1 }, { unique: true });
roommateSchema.index({ hostelType: 1, hostel: 1, room: 1 });

const Roommate = mongoose.model("Roommate", roommateSchema);

/* =========================
   ROUTES
========================= */

// ➕ Register roommate
app.post("/api/submit", async (req, res) => {
  const { name, email, branch, hostelType, hostel, room, instagram } = req.body;

  if (!name || !email || !branch || !hostelType || !hostel || !room) {
    return res.status(400).json({
      success: false,
      message: "All fields except Instagram are required."
    });
  }

  try {
    const cleanedEmail = email.toLowerCase().trim();

    const exists = await Roommate.findOne({
      email: cleanedEmail,
      hostel: hostel.trim(),
      room: room.trim()
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "You have already registered for this room."
      });
    }

    await new Roommate({
      name: name.trim(),
      email: cleanedEmail,
      branch: branch.trim().toUpperCase(),
      hostelType: hostelType.trim().toLowerCase(),
      hostel: hostel.trim(),
      room: room.trim(),
      instagram: instagram?.trim() || ""
    }).save();

    return res.json({
      success: true,
      message: "Registration successful."
    });

  } catch (err) {
  console.error("Submit error:", err);

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "You have already registered for this room."
    });
  }

  return res.status(500).json({
    success: false,
    message: "Unexpected server error."
  });
}

  });

// 🔍 Lookup roommates
app.post("/api/lookup", async (req, res) => {
  const { name, email, branch, hostelType, hostel, room } = req.body;

  if (!name || !email || !branch || !hostelType || !hostel || !room) {
    return res.status(400).json({
      success: false,
      message: "All fields are required."
    });
  }

  try {
    const user = await Roommate.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      email: email.toLowerCase().trim(),
      branch: branch.trim().toUpperCase(),
      hostelType: hostelType.trim().toLowerCase(),
      hostel: hostel.trim(),
      room: room.trim()
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "No matching registration found."
      });
    }

    const roommates = await Roommate.find({
      hostelType: hostelType.trim().toLowerCase(),
      hostel: hostel.trim(),
      room: room.trim(),
      email: { $ne: email.toLowerCase().trim() }
    }).select("name branch email instagram -_id");

    if (!roommates.length) {
      return res.json({
        success: false,
        message: "No roommates found yet."
      });
    }

    return res.json({
      success: true,
      roommates
    });

  } catch (err) {
    console.error("Lookup error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error during lookup."
    });
  }
});

/* =========================
   SERVER START
========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

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
const MONGO_URI = process.env.MONGODB_URI;

if (!PORT) {
  console.error("❌ PORT missing");
  process.exit(1);
}

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI missing");
  process.exit(1);
}

/* =========================
   CORS (MUST BE FIRST)
========================= */
const corsOptions = {
  origin: "https://srmfindmyroomie.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* =========================
   BODY + STATIC
========================= */
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   HEALTH CHECK (NO DB)
========================= */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* =========================
   DATABASE
========================= */
mongoose.set("bufferCommands", false);

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
});

mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 MongoDB error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟡 MongoDB disconnected");
});

/* =========================
   DB GUARD (SKIP OPTIONS)
========================= */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database not connected. Try again shortly."
    });
  }

  next();
});

/* =========================
   SCHEMA
========================= */
const roommateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  branch: { type: String, required: true, trim: true, uppercase: true },
  hostelType: { type: String, required: true, trim: true, lowercase: true },
  hostel: { type: String, required: true, trim: true },
  room: { type: String, required: true, trim: true },
  instagram: { type: String, default: "" },
  registeredAt: { type: Date, default: Date.now }
});

roommateSchema.index({ email: 1, hostel: 1, room: 1 }, { unique: true });
roommateSchema.index({ hostelType: 1, hostel: 1, room: 1 });

const Roommate =
  mongoose.models.Roommate ||
  mongoose.model("Roommate", roommateSchema);

/* =========================
   ROUTES
========================= */

// ➕ SUBMIT
app.post("/api/submit", async (req, res) => {
  try {
    await Roommate.create(req.body);
    return res.json({
      success: true,
      message: "Registration successful"
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
      message: err.message
    });
  }
});

// 🔍 LOOKUP
app.post("/api/lookup", async (req, res) => {
  try {
    const { name, email, branch, hostelType, hostel, room } = req.body;

    const user = await Roommate.findOne({
      name: new RegExp(`^${name}$`, "i"),
      email: email.toLowerCase(),
      branch: branch.toUpperCase(),
      hostelType: hostelType.toLowerCase(),
      hostel,
      room
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "No matching registration found."
      });
    }

    const roommates = await Roommate.find({
      hostelType: hostelType.toLowerCase(),
      hostel,
      room,
      email: { $ne: email.toLowerCase() }
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
    console.error("Lookup error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

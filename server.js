require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGODB_URI;

if (!PORT || !MONGO_URI) {
  console.error("Missing PORT or MONGODB_URI");
  process.exit(1);
}

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.set("bufferCommands", false);
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err.message);
});

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  if (req.path.startsWith("/api") && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database not connected"
    });
  }
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api", apiLimiter);

const norm = (s) => s?.trim();
const normUpper = (s) => s?.trim().toUpperCase();
const normLower = (s) => s?.trim().toLowerCase();

const roommateSchema = new mongoose.Schema({
  name: String,
  email: { type: String, lowercase: true },
  branch: { type: String, uppercase: true },
  hostelType: String,
  hostel: String,
  room: String,
  contactType: {
    type: String,
    enum: ["instagram", "discord", "phone", "x", "other"]
  },
  contactValue: String,
  registeredAt: { type: Date, default: Date.now }
}, { strict: false });

roommateSchema.index(
  { email: 1, hostel: 1, room: 1 },
  { unique: true }
);

const Roommate = mongoose.model("Roommate", roommateSchema);

app.post("/api/submit", async (req, res) => {
  try {
    const email = normLower(req.body.email);

    if (!email || !email.endsWith("@srmist.edu.in")) {
      return res.status(400).json({
        success: false,
        message: "Only @srmist.edu.in emails are allowed"
      });
    }

    const data = {
      name: normUpper(req.body.name),
      email,
      branch: normUpper(req.body.branch),
      hostelType: req.body.hostelType,
      hostel: norm(req.body.hostel),
      room: normUpper(req.body.room),
      contactType: req.body.contactType || "email",
      contactValue: norm(req.body.contactValue)
    };

    await Roommate.create(data);

    res.json({
      success: true,
      message: "Registration successful"
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Already registered"
      });
    }

    res.status(500).json({
      success: false,
      message: e.message
    });
  }
});


app.post("/api/lookup", async (req, res) => {
  try {
    const name = normUpper(req.body.name);
    const email = normLower(req.body.email);
    const branch = normUpper(req.body.branch);
    const hostelType = req.body.hostelType;
    const hostel = norm(req.body.hostel);
    const room = normUpper(req.body.room);

    const user = await Roommate.findOne({
      name,
      email,
      branch,
      hostelType,
      hostel,
      room
    });

    if (!user) {
      return res.json({
        success: false,
        message: "No match"
      });
    }

    const roommates = await Roommate.find({
      hostelType,
      hostel,
      room,
      email: { $ne: email }
    }).select("name branch contactType contactValue -_id");

    if (!roommates.length) {
      return res.json({
        success: false,
        message: "No roommates yet"
      });
    }

    res.json({
      success: true,
      roommates
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Lookup failed"
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

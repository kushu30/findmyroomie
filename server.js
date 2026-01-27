require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGODB_URI;

if (!PORT || !MONGO_URI) {
  process.exit(1);
}

app.use(cors({
  origin: "https://srmfindmyroomie.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 200
}));
app.options("*", cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.send("OK");
});

mongoose.set("bufferCommands", false);
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });

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

const roommateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  branch: { type: String, required: true, trim: true, uppercase: true },
  hostelType: { type: String, required: true, trim: true, lowercase: true },
  hostel: { type: String, required: true, trim: true },
  room: { type: String, required: true, trim: true },
  contactType: {
    type: String,
    enum: ["instagram", "discord", "phone", "other"],
    required: true
  },
  contactValue: { type: String, required: true, trim: true },
  registeredAt: { type: Date, default: Date.now }
});

roommateSchema.index({ email: 1, hostel: 1, room: 1 }, { unique: true });
roommateSchema.index({ hostelType: 1, hostel: 1, room: 1 });

const Roommate = mongoose.models.Roommate || mongoose.model("Roommate", roommateSchema);

app.post("/api/submit", async (req, res) => {
  try {
    await Roommate.create(req.body);
    res.json({ success: true, message: "Registration successful" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already registered for this room."
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

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
    }).select("name branch email contactType contactValue -_id");

    if (!roommates.length) {
      return res.json({
        success: false,
        message: "No roommates found yet."
      });
    }

    res.json({ success: true, roommates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, "0.0.0.0");

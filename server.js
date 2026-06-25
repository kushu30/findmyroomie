require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || "findmyroomie-default-secret-change-in-prod";

if (!MONGO_URI) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

if (!GOOGLE_CLIENT_ID) {
  console.error("Missing GOOGLE_CLIENT_ID");
  process.exit(1);
}

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- MongoDB ---
mongoose.set("bufferCommands", false);
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
}).catch(err => {
  console.error("MongoDB initial connection error:", err.message);
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// --- Helpers ---
const norm = (s) => s?.trim();
const normUpper = (s) => s?.trim().toUpperCase();

// --- Middleware ---
// JWT auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Session expired. Please log in again." });
    }
    req.user = decoded;
    next();
  });
}

// Rate limiter for /api
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api", apiLimiter);

// DB check middleware (but skip /api/config which doesn't need the DB)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  const dbFreeRoutes = ["/api/config"];
  if (req.path.startsWith("/api") && !dbFreeRoutes.includes(req.path) && mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: "Database not connected. Please try again shortly." });
  }
  next();
});

// --- Schema ---
const contactSchema = new mongoose.Schema({
  platform: { type: String, enum: ["email", "phone", "snapchat", "instagram", "discord", "x", "other"] },
  value: String
}, { _id: false });

const roommateSchema = new mongoose.Schema({
  name: String,
  email: { type: String, lowercase: true, unique: true },
  srmId: String,
  branch: String,
  hostelType: String,
  hostel: String,
  room: String,
  contacts: [contactSchema],
  registered: { type: Boolean, default: false },
  hostelEdits: { type: Number, default: 0 },
  registeredAt: { type: Date, default: Date.now }
});

const Roommate = mongoose.model("Roommate", roommateSchema);

// --- Google OAuth client ---
const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ==============================
// ROUTES
// ==============================

// Config endpoint — no DB needed, safe to always call
app.get("/api/config", (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null
  });
});

// Google Sign-In
app.post("/api/auth/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ success: false, message: "Google credential is required" });
  }

  try {
    let email, name;

    // Verify real Google token
    const ticket = await oauthClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    email = payload.email.toLowerCase();
    name = payload.name;

    const adminEmails = process.env.ADMIN_EMAIL 
      ? process.env.ADMIN_EMAIL.toLowerCase().split(",").map(e => e.trim()) 
      : [];

    // Find or create user
    let user = await Roommate.findOne({ email });
    if (!user) {
      user = await Roommate.create({
        email,
        name, // store name as-is from Google (proper case)
        registered: false,
        contacts: []
      });
    } else {
      // Update name if it changed in Google account
      if (user.name !== name) {
        user.name = name;
        await user.save();
      }
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      registered: user.registered,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error("Google auth failed:", err.message);
    res.status(401).json({ success: false, message: "Authentication failed. " + err.message });
  }
});

// Get current user profile
app.get("/api/me", authenticateToken, async (req, res) => {
  try {
    const user = await Roommate.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("GET /api/me error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
});

// Save or update profile
app.post("/api/register", authenticateToken, async (req, res) => {
  try {
    const { name, branch, hostelType, hostel, room, contacts, srmId } = req.body;

    // Input validation
    if (!norm(name)) return res.status(400).json({ success: false, message: "Name is required" });
    if (!norm(branch)) return res.status(400).json({ success: false, message: "Branch is required" });
    if (!hostelType) return res.status(400).json({ success: false, message: "Hostel type is required" });
    if (!norm(hostel)) return res.status(400).json({ success: false, message: "Hostel block is required" });
    if (!normUpper(room)) return res.status(400).json({ success: false, message: "Room number is required" });
    if (!normUpper(srmId)) return res.status(400).json({ success: false, message: "SRM ID is required" });

    // Sanitize contacts: filter out entries with empty values
    const cleanContacts = Array.isArray(contacts)
      ? contacts
          .filter(c => c.platform && norm(c.value))
          .map(c => ({ platform: c.platform, value: norm(c.value) }))
      : [];

    // Fetch existing user to check limits
    const currentUser = await Roommate.findOne({ email: req.user.email });
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isHostelChanging = currentUser.registered && (
      currentUser.hostelType !== hostelType ||
      currentUser.hostel !== norm(hostel) ||
      currentUser.room !== normUpper(room)
    );

    if (isHostelChanging && currentUser.hostelEdits >= 1) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already changed your hostel details once. Further changes are not allowed." 
      });
    }

    if (currentUser.srmId && normUpper(srmId) !== currentUser.srmId) {
      return res.status(400).json({ 
        success: false, 
        message: "SRM ID cannot be changed once set." 
      });
    }

    const updatedData = {
      name: norm(name),          // preserve original Google name case, just trim
      branch: normUpper(branch), // branches are all-caps
      hostelType,
      hostel: norm(hostel),
      room: normUpper(room),
      contacts: cleanContacts,
      registered: true
    };

    if (!currentUser.srmId) {
      updatedData.srmId = normUpper(srmId);
    }

    const updateQuery = { $set: updatedData };
    if (isHostelChanging) {
      updateQuery.$inc = { hostelEdits: 1 };
    }

    const user = await Roommate.findOneAndUpdate(
      { email: req.user.email },
      updateQuery,
      { new: true, runValidators: false } // skip validators to avoid enum issues on update
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile saved!", user });
  } catch (err) {
    console.error("POST /api/register error:", err);
    res.status(500).json({ success: false, message: "Failed to save profile. " + err.message });
  }
});

// Get roommate matches
app.get("/api/roommates", authenticateToken, async (req, res) => {
  try {
    const user = await Roommate.findOne({ email: req.user.email });
    if (!user || !user.registered) {
      return res.status(400).json({ success: false, message: "Please complete your profile first." });
    }

    if (!user.hostel || !user.room || !user.hostelType) {
      return res.json({ success: true, roommates: [] });
    }

    const roommates = await Roommate.find({
      hostelType: user.hostelType,
      hostel: user.hostel,
      room: user.room,
      email: { $ne: user.email },
      registered: true
    }).select("name branch email contacts -_id");

    res.json({ success: true, roommates });
  } catch (err) {
    console.error("GET /api/roommates error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch roommates." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

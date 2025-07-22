const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Init Express
const app = express();
const PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGODB_URI;

// Allow CORS from Netlify or all (temporary)
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || '*'
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Schema
const roommateSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { 
        type: String, required: true, trim: true, lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'] 
    },
    branch: { type: String, required: true, trim: true, uppercase: true },
    hostelType: { type: String, required: true, trim: true, lowercase: true },
    hostel: { type: String, required: true, trim: true },
    room: { type: String, required: true, trim: true },
    instagram: { type: String, trim: true, default: '' },
    registeredAt: { type: Date, default: Date.now }
});

roommateSchema.index({ email: 1, hostel: 1, room: 1 }, { unique: true });
roommateSchema.index({ hostelType: 1, hostel: 1, room: 1 });

const Roommate = mongoose.model('Roommate', roommateSchema);

// Routes

// ➕ Submit roommate registration
app.post('/submit', async (req, res) => {
    const { name, email, branch, hostelType, hostel, room, instagram } = req.body;

    if (!name || !email || !branch || !hostelType || !hostel || !room) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, branch, hostel type, hostel, and room are required.'
        });
    }

    try {
        const cleanedEmail = email.toLowerCase().trim();
        const cleanedRoom = room.trim();
        const cleanedHostel = hostel.trim();

        const alreadyExists = await Roommate.findOne({
            email: cleanedEmail,
            hostel: cleanedHostel,
            room: cleanedRoom
        });

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: 'You have already registered for this room.'
            });
        }

        const newRoommate = new Roommate({
            name: name.trim(),
            email: cleanedEmail,
            branch: branch.trim().toUpperCase(),
            hostelType: hostelType.trim().toLowerCase(),
            hostel: cleanedHostel,
            room: cleanedRoom,
            instagram: instagram?.trim() || ''
        });

        await newRoommate.save();

        return res.json({
            success: true,
            message: 'Registration successful. You can now use the lookup feature.'
        });

    } catch (err) {
        console.error('Error in /submit:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while registering.'
        });
    }
});

// 🔍 Lookup roommates
app.post('/lookup', async (req, res) => {
    const { name, email, branch, hostelType, hostel, room } = req.body;

    if (!name || !email || !branch || !hostelType || !hostel || !room) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required for lookup.'
        });
    }

    try {
        const cleanedName = name.trim();
        const cleanedEmail = email.toLowerCase().trim();
        const cleanedBranch = branch.trim().toUpperCase();
        const cleanedHostelType = hostelType.trim().toLowerCase();
        const cleanedHostel = hostel.trim();
        const cleanedRoom = room.trim();

        const userExists = await Roommate.findOne({
            name: { $regex: new RegExp(`^${cleanedName}$`, 'i') },
            email: cleanedEmail,
            branch: cleanedBranch,
            hostelType: cleanedHostelType,
            hostel: cleanedHostel,
            room: cleanedRoom
        });

        if (!userExists) {
            return res.status(403).json({
                success: false,
                message: 'No matching registration found. Please check details or register first.'
            });
        }

        const roommates = await Roommate.find({
            hostelType: cleanedHostelType,
            hostel: cleanedHostel,
            room: cleanedRoom,
            email: { $ne: cleanedEmail }
        }).select('name branch email -_id instagram');

        if (roommates.length === 0) {
            return res.json({
                success: false,
                message: 'No roommates found for this room yet.'
            });
        }

        const formatted = roommates.map(r => ({
            name: r.name,
            branch: r.branch,
            instagram: r.instagram || undefined,
            email: r.email
        }));

        return res.json({
            success: true,
            roommates: formatted
        });

    } catch (err) {
        console.error('Error in /lookup:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error during roommate lookup.'
        });
    }
});

// 🛠 Admin - Get all registrations
app.get('/admin/registrations', async (req, res) => {
    try {
        const registrations = await Roommate.find().sort({ registeredAt: -1 });
        res.json({
            success: true,
            count: registrations.length,
            registrations
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registrations'
        });
    }
});

// 🗑 Admin - Clear all registrations
app.delete('/admin/clear', async (req, res) => {
    try {
        await Roommate.deleteMany({});
        res.json({
            success: true,
            message: 'All registrations cleared successfully.'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to clear registrations'
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

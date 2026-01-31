require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGODB_URI;

if (!PORT || !MONGO_URI) process.exit(1);

app.use(cors({
  origin: "https://srmfindmyroomie.vercel.app",
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.options("*", cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.set("bufferCommands", false);
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });

app.use((req,res,next)=>{
  if(req.method==="OPTIONS") return res.sendStatus(200);
  if(mongoose.connection.readyState!==1)
    return res.status(503).json({success:false,message:"Database not connected"});
  next();
});

const roommateSchema = new mongoose.Schema({
  name:String,
  email:{type:String,lowercase:true},
  branch:{type:String,uppercase:true},
  hostelType:String,
  hostel:String,
  room:String,
  contactType:{
    type:String,
    enum:["instagram","discord","phone","x","other"]
  },
  contactValue:String,
  registeredAt:{type:Date,default:Date.now}
});

roommateSchema.index({email:1,hostel:1,room:1},{unique:true});

const Roommate = mongoose.model("Roommate",roommateSchema);

app.post("/api/submit", async (req,res)=>{
  try{
    await Roommate.create(req.body);
    res.json({success:true,message:"Registration successful"});
  }catch(e){
    if(e.code===11000)
      return res.status(409).json({success:false,message:"Already registered"});
    res.status(500).json({success:false,message:e.message});
  }
});

app.post("/api/lookup", async (req,res)=>{
  const {name,email,branch,hostelType,hostel,room}=req.body;
  const user = await Roommate.findOne({
    name:new RegExp(`^${name}$`,"i"),
    email:email.toLowerCase(),
    branch:branch.toUpperCase(),
    hostelType,
    hostel,
    room
  });
  if(!user) return res.status(403).json({success:false,message:"No match"});
  const roommates = await Roommate.find({
    hostelType,hostel,room,email:{$ne:email.toLowerCase()}
  }).select("name branch contactType contactValue -_id");
  if(!roommates.length)
    return res.json({success:false,message:"No roommates yet"});
  res.json({success:true,roommates});
});

app.listen(PORT,"0.0.0.0");


![Logo](image-1.png)

**FindMyRoomie** is a web-based roommate discovery tool designed for students residing in hostels. It allows users to register their room details and securely find others sharing the same room. The goal is to provide a simple, privacy-conscious platform to ease the roommate discovery process, especially during new academic sessions.

## Deployment:

[FindMyRoomie](https://srmfindmyroomie.vercel.app/)

## Overview

This project allows students to:
- Register their hostel room details (name, email, branch, hostel type, hostel name, room number, and optional Instagram ID).
- Look up registered roommates based on the room information.
- View verified matches without exposing contact information unless explicitly provided.

A short video demonstration is included in the repository, along with the official logo.

## How It Works

1. **Registration**:  
   Students fill a registration form with their personal and room information. Upon submission, the backend validates and stores the data.

2. **Roommate Lookup**:  
   When a student enters their room details, the system checks if someone else has registered the same hostel and room (excluding the current user). If matches are found, their name, branch, and either Instagram ID or email (depending on availability) are displayed.

3. **Data Handling**:  
   All user data is stored in MongoDB Atlas and accessed via Mongoose. Duplicate registrations (same email-hostel-room) are prevented.

## Technology Stack

- **Frontend**:  
  HTML, CSS, JavaScript

- **Backend**:  
  Node.js, Express.js

- **Database**:  
  MongoDB Atlas (Mongoose ODM)

- **Other Tools**:  
  CORS for cross-origin requests, Body-parser for handling JSON data, and basic form validation.

## Maintainer

Developed and maintained by **Kushagra Shukla**.

For any queries, feel free to raise an issue or reach out directly.

## Screenshots 
<img width="1860" height="1125" alt="image" src="https://github.com/user-attachments/assets/c1d1a21a-34be-43fe-a987-4d53b04ec9f9" />
<img width="1860" height="1125" alt="image" src="https://github.com/user-attachments/assets/b9de3ae6-ad96-46a1-9822-2118872eaac7" />
<img width="1860" height="1125" alt="image" src="https://github.com/user-attachments/assets/50285210-4013-4670-88f8-b6b7f9df2f85" />
<img width="1860" height="1125" alt="image" src="https://github.com/user-attachments/assets/cf16885d-7119-4d6e-80ed-abef8b30e073" />


## Demo Video (Click the link to view)

![Demo Video](https://github.com/user-attachments/assets/fca28698-9a26-48db-ac8e-eb8809762546)

## Made by:
- [@kushu30](https://www.github.com/kushu30)
- [@ananyarana21](https://www.github.com/ananyarana21)


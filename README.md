
![Logo](https://private-user-images.githubusercontent.com/178865275/469686833-a1e579c9-57f7-483b-b7a3-d0b89253747d.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NTMyNjQyODQsIm5iZiI6MTc1MzI2Mzk4NCwicGF0aCI6Ii8xNzg4NjUyNzUvNDY5Njg2ODMzLWExZTU3OWM5LTU3ZjctNDgzYi1iN2EzLWQwYjg5MjUzNzQ3ZC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNzIzJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDcyM1QwOTQ2MjRaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1hMWU1NjZmMmZmYzc4MGRkYWJkMTg0NTYwOTE2NjRlNmIxZTAxY2U1M2VkMTE5NzEwZDI2MTM2YmZmOTA1ZDM3JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.UETtVvm0aftWt70-ojprbdblr8kqQE8bkqsXRgk-TVI)


**FindMyRoomie** is a web-based roommate discovery tool designed for students residing in hostels. It allows users to register their room details and securely find others sharing the same room. The goal is to provide a simple, privacy-conscious platform to ease the roommate discovery process, especially during new academic sessions.

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


## Demo

![Demo](https://private-user-images.githubusercontent.com/178865275/469697701-3c93f8b5-dbaf-4714-a377-c56725341e3d.webm?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NTMyNjU1ODMsIm5iZiI6MTc1MzI2NTI4MywicGF0aCI6Ii8xNzg4NjUyNzUvNDY5Njk3NzAxLTNjOTNmOGI1LWRiYWYtNDcxNC1hMzc3LWM1NjcyNTM0MWUzZC53ZWJtP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI1MDcyMyUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNTA3MjNUMTAwODAzWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9NDJiYmNjMTdmNzI2YTA4NzYxMDlhZTI4ZTEzMGVhYWYxNTgxNjgwYzcxODA0N2U1ZThmNzM2ZDM1MjVmZDI5NSZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QifQ.JHX68D31kJbIvCkTkICLuKtUMGIB1NuUpxHGG9hzPdc)
## Made by:

- [@kushu30](https://www.github.com/kushu30)


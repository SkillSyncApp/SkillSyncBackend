# Skill Sync - Server

Welcome to the Skill Sync server! This server provides the backend functionality for the Skill Sync application, facilitating user authentication, post management, and collaboration features.

## Overview

The Skill Sync server is built using Node.js and Express.js, providing a RESTful API for interacting with the database and handling various client requests. It leverages MongoDB as the database to store user data, posts, and other application information.

---

## Features

- **User Authentication**: Secure user authentication using JWT tokens and password hashing.
- **Post Management**: CRUD operations for creating, reading, updating, and deleting posts.
- **Commenting**: Ability for users to add comments to posts for collaboration and discussion.
- **Authorization**: Role-based authorization to control access to different parts of the application.
- **Error Handling**: Comprehensive error handling to ensure robustness and reliability of the server.
- **File Uploads**: Utilizes Multer middleware for handling file uploads.

---

## Technologies Used

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express.js**: Web application framework for Node.js, simplifying the process of building APIs.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: MongoDB object modeling for Node.js, providing a straight-forward, schema-based solution.
- **JWT**: JSON Web Tokens for secure authentication.
- **bcrypt**: Library for hashing passwords to ensure security.
- **Multer**: Middleware for handling multipart/form-data, primarily used for file uploads.

---

## Setup Instructions

1. Clone the repository.
2. Navigate to the server directory: `cd server`.
3. Install dependencies: `npm install`.
4. Set up environment variables by creating a `.env` file and adding necessary variables like database connection URI, JWT secret, etc.
5. Start the server: `npm start`.

---

## API Documentation

The API endpoints and their functionalities are documented in the [API Documentation](API_DOCUMENTATION.md) file.

---

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvements, please open an issue or submit a pull request.


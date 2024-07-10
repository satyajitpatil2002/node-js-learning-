const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 5000;
const mongoose = require("mongoose");

// Connection to MongoDB
mongoose
    .connect('mongodb://127.0.0.1:27017/satya-app1')
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));

// Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    jobTitle: {
        type: String,
    },
    gender: {
        type: String,
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());  // Middleware to parse JSON request bodies

// Routes
app.get('/users', async (req, res) => {
    try {
        const allDbUsers = await User.find({});
        const html = `
        <ul>
        ${allDbUsers.map((user) => `<li>${user.firstName}- ${user.email}</li>`).join(" ")}
        </ul>`;
        res.send(html);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// REST API
app.get('/api/users', async (req, res) => {
    try {
        const allDbUsers = await User.find({});
        return res.json(allDbUsers);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/users', async (req, res) => {
    const body = req.body;
    if (
        !body || 
        !body.firstName || 
        !body.lastName ||
        !body.email || 
        !body.gender ||
        !body.jobTitle
    ) {
        return res.status(400).json({ msg: "All fields are required" });
    }

    try {
        const result = await User.create({
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            gender: body.gender,
            jobTitle: body.jobTitle,
        });
        
        return res.status(201).json({ msg: "success", user: result });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
});

app.patch('/api/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ error: "User not found" });
        return res.json({ status: "updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ error: "User not found" });
        return res.json({ status: "deleted successfully", user: deletedUser });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));

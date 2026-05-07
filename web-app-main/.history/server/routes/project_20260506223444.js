const express = require("express");
const Project = require("../models/Project");
const User = require("../models/User");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

router.post("/", auth, role("admin"), async (req, res) => {
    try {
        const { name, description, members = [] } = req.body;

        if (!name) {
            return res.status(400).json({ msg: "Project name is required" });
        }

        const validMembers = await User.find({ _id: { $in: members } }).select("_id");
        if (validMembers.length !== members.length) {
            return res.status(400).json({ msg: "One or more member IDs are invalid" });
        }

        const dedupedMembers = [...new Set([req.user.id, ...members].map(String))];
        const project = await Project.create({
            name,
            description,
            members: dedupedMembers,
            createdBy: req.user.id
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ msg: "Project creation failed", error: error.message });
    }
});

router.get("/", auth, async (req, res) => {
    try {
        const query = req.user.role === "admin"
            ? {}
            : { members: req.user.id };

        const projects = await Project.find(query)
            .populate("members", "name email role")
            .populate("createdBy", "name email role")
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ msg: "Fetching projects failed", error: error.message });
    }
});

module.exports = router;

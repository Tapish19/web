const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const auth = require("../middleware/auth");

const router = express.Router();

const canAccessProject = (project, user) => {
    if (!project) return false;
    if (user.role === "admin") return true;
    return project.members.some((memberId) => memberId.toString() === user.id);
};

router.post("/", auth, async (req, res) => {
    try {
        const { title, description, projectId, assignedTo, status, dueDate } = req.body;
        if (!title || !projectId || !assignedTo || !dueDate) {
            return res.status(400).json({ msg: "title, projectId, assignedTo and dueDate are required" });
        }

        if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(assignedTo)) {
            return res.status(400).json({ msg: "Invalid projectId or assignedTo" });
        }

        const project = await Project.findById(projectId);
        if (!canAccessProject(project, req.user)) {
            return res.status(403).json({ msg: "Not allowed to create tasks for this project" });
        }

        const isAssigneeMember = project.members.some((memberId) => memberId.toString() === assignedTo);
        if (!isAssigneeMember) {
            return res.status(400).json({ msg: "assignedTo must be a project member" });
        }

        const task = await Task.create({ title, description, projectId, assignedTo, status, dueDate });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ msg: "Task creation failed", error: error.message });
    }
});

router.get("/project/:id", auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: "Invalid project id" });
        }

        const project = await Project.findById(req.params.id);
        if (!canAccessProject(project, req.user)) {
            return res.status(403).json({ msg: "Not allowed to view tasks for this project" });
        }

        const tasks = await Task.find({ projectId: req.params.id })
            .populate("assignedTo", "name email role")
            .sort({ dueDate: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ msg: "Fetching tasks failed", error: error.message });
    }
});

router.put("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: "Invalid task id" });
        }

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: "Task not found" });

        const project = await Project.findById(task.projectId);
        if (!canAccessProject(project, req.user)) {
            return res.status(403).json({ msg: "Not allowed to update this task" });
        }

        if (req.user.role === "member" && task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ msg: "Members can only update tasks assigned to themselves" });
        }

        const allowedFields = ["title", "description", "status", "assignedTo", "dueDate"];
        const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ msg: "Task update failed", error: error.message });
    }
});

router.get("/dashboard/summary", auth, async (req, res) => {
    try {
        const projects = await Project.find(req.user.role === "admin" ? {} : { members: req.user.id }).select("_id");
        const projectIds = projects.map((p) => p._id);

        const query = req.user.role === "admin"
            ? { projectId: { $in: projectIds } }
            : { projectId: { $in: projectIds }, assignedTo: req.user.id };

        const now = new Date();
        const [total, todo, inProgress, done, overdue] = await Promise.all([
            Task.countDocuments(query),
            Task.countDocuments({ ...query, status: "todo" }),
            Task.countDocuments({ ...query, status: "in-progress" }),
            Task.countDocuments({ ...query, status: "done" }),
            Task.countDocuments({ ...query, status: { $ne: "done" }, dueDate: { $lt: now } })
        ]);

        res.json({ total, todo, inProgress, done, overdue });
    } catch (error) {
        res.status(500).json({ msg: "Dashboard summary failed", error: error.message });
    }
});

module.exports = router;

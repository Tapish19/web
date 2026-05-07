const express = require("express");
const Project = require("../models/Project");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Create Project
router.post("/", auth, async (req, res) => {
    try {
        const {
            title,
            description,
            members = []
        } = req.body;

        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({
                msg: "Project title is required"
            });
        }

        // Validate member IDs
        const validMembers = await User.find({
            _id: { $in: members }
        }).select("_id");

        if (validMembers.length !== members.length) {
            return res.status(400).json({
                msg: "One or more member IDs are invalid"
            });
        }

        // Ensure creator is included
        const dedupedMembers = [
            ...new Set(
                [req.user.id, ...members].map(String)
            )
        ];

        // Create project
        const project = await Project.create({
            title: title.trim(),
            description: description || "",
            members: dedupedMembers,
            createdBy: req.user.id
        });

        // Populate members & creator
        const populatedProject =
            await Project.findById(project._id)
                .populate(
                    "members",
                    "name email role"
                )
                .populate(
                    "createdBy",
                    "name email role"
                );

        res.status(201).json(populatedProject);

    } catch (error) {
        res.status(500).json({
            msg: "Project creation failed",
            error: error.message
        });
    }
});

// Get All Accessible Projects
router.get("/", auth, async (req, res) => {
    try {

        // Admin sees all
        // Members see only joined projects
        const query =
            req.user.role === "admin"
                ? {}
                : { members: req.user.id };

        const projects = await Project.find(query)
            .populate(
                "members",
                "name email role"
            )
            .populate(
                "createdBy",
                "name email role"
            )
            .sort({ createdAt: -1 });

        res.json(projects);

    } catch (error) {
        res.status(500).json({
            msg: "Fetching projects failed",
            error: error.message
        });
    }
});

// Get Single Project
router.get("/:id", auth, async (req, res) => {
    try {
        const project = await Project.findById(
            req.params.id
        )
            .populate(
                "members",
                "name email role"
            )
            .populate(
                "createdBy",
                "name email role"
            );

        if (!project) {
            return res.status(404).json({
                msg: "Project not found"
            });
        }

        // Check access
        const canAccess =
            req.user.role === "admin" ||
            project.members.some(
                (member) =>
                    member._id.toString() ===
                    req.user.id
            );

        if (!canAccess) {
            return res.status(403).json({
                msg: "Forbidden"
            });
        }

        res.json(project);

    } catch (error) {
        res.status(500).json({
            msg: "Fetching project failed",
            error: error.message
        });
    }
});

// Update Project
router.put("/:id", auth, async (req, res) => {
    try {
        const project = await Project.findById(
            req.params.id
        );

        if (!project) {
            return res.status(404).json({
                msg: "Project not found"
            });
        }

        // Only creator or admin
        const canEdit =
            req.user.role === "admin" ||
            project.createdBy.toString() ===
                req.user.id;

        if (!canEdit) {
            return res.status(403).json({
                msg: "Forbidden"
            });
        }

        const updates = {};

        if (req.body.title) {
            updates.title =
                req.body.title.trim();
        }

        if (
            req.body.description !== undefined
        ) {
            updates.description =
                req.body.description;
        }

        const updatedProject =
            await Project.findByIdAndUpdate(
                req.params.id,
                updates,
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate(
                    "members",
                    "name email role"
                )
                .populate(
                    "createdBy",
                    "name email role"
                );

        res.json(updatedProject);

    } catch (error) {
        res.status(500).json({
            msg: "Updating project failed",
            error: error.message
        });
    }
});

// Delete Project
router.delete("/:id", auth, async (req, res) => {
    try {
        const project = await Project.findById(
            req.params.id
        );

        if (!project) {
            return res.status(404).json({
                msg: "Project not found"
            });
        }

        // Only creator or admin
        const canDelete =
            req.user.role === "admin" ||
            project.createdBy.toString() ===
                req.user.id;

        if (!canDelete) {
            return res.status(403).json({
                msg: "Forbidden"
            });
        }

        await project.deleteOne();

        res.json({
            msg: "Project deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            msg: "Deleting project failed",
            error: error.message
        });
    }
});
// ADD MEMBER TO PROJECT
router.put(
    "/:id/members",
    auth,
    async (req, res) => {
        try {

            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    msg: "Email is required"
                });
            }

            const project =
                await Project.findById(
                    req.params.id
                );

            if (!project) {
                return res.status(404).json({
                    msg:
                        "Project not found"
                });
            }

            // Only creator/admin
            const canManage =
                req.user.role ===
                    "admin" ||
                project.createdBy.toString() ===
                    req.user.id;

            if (!canManage) {
                return res.status(403).json({
                    msg: "Forbidden"
                });
            }

            // Find user
            const user =
                await User.findOne({
                    email:
                        email
                            .toLowerCase()
                            .trim()
                });

            if (!user) {
                return res.status(404).json({
                    msg:
                        "User not found"
                });
            }

            // Avoid duplicate members
            const alreadyMember =
                project.members.some(
                    (memberId) =>
                        memberId.toString() ===
                        user._id.toString()
                );

            if (alreadyMember) {
                return res.status(400).json({
                    msg:
                        "User already added"
                });
            }

            // Add member
            project.members.push(
                user._id
            );

            await project.save();

            const updatedProject =
                await Project.findById(
                    project._id
                )
                    .populate(
                        "members",
                        "name email role"
                    )
                    .populate(
                        "createdBy",
                        "name email role"
                    );

            res.json(
                updatedProject
            );

        } catch (error) {

            res.status(500).json({
                msg:
                    "Adding member failed",
                error:
                    error.message
            });

        }
    }
);
module.exports = router;
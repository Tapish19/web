const express = require("express");
const mongoose = require("mongoose");

const Task = require("../models/Task");
const Project = require("../models/Project");

const auth = require("../middleware/auth");

const router = express.Router();

const canAccessProject = (
    project,
    user
) => {

    if (!project) {
        return false;
    }

    if (user.role === "admin") {
        return true;
    }

    return project.members.some(
        (memberId) =>
            memberId.toString() ===
            user.id
    );
};

// CREATE TASK
router.post("/", auth, async (req, res) => {

    try {

        const {
            title,
            description,
            projectId,
            assignedTo,
            status,
            dueDate
        } = req.body;

        // Required validation
        if (
            !title ||
            !projectId ||
            !assignedTo ||
            !dueDate
        ) {
            return res.status(400).json({
                msg:
                    "title, projectId, assignedTo and dueDate are required"
            });
        }

        // Validate ObjectIds
        if (
            !mongoose.Types.ObjectId.isValid(
                projectId
            ) ||
            !mongoose.Types.ObjectId.isValid(
                assignedTo
            )
        ) {
            return res.status(400).json({
                msg:
                    "Invalid projectId or assignedTo"
            });
        }

        // Validate due date
        const parsedDate =
            new Date(dueDate);

        if (
            isNaN(
                parsedDate.getTime()
            )
        ) {
            return res.status(400).json({
                msg: "Invalid due date"
            });
        }

        // Prevent past dates
        const today = new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        if (parsedDate < today) {
            return res.status(400).json({
                msg:
                    "Due date cannot be in the past"
            });
        }

        // Find project
        const project =
            await Project.findById(
                projectId
            );

        if (!project) {
            return res.status(404).json({
                msg: "Project not found"
            });
        }

        // Access check
        if (
            !canAccessProject(
                project,
                req.user
            )
        ) {
            return res.status(403).json({
                msg:
                    "Not allowed to create tasks for this project"
            });
        }

        // Assignee must be member
        const isAssigneeMember =
            project.members.some(
                (memberId) =>
                    memberId.toString() ===
                    assignedTo
            );

        if (!isAssigneeMember) {
            return res.status(400).json({
                msg:
                    "assignedTo must be a project member"
            });
        }

        // Create task
        const task =
            await Task.create({
                title:
                    title.trim(),

                description:
                    description || "",

                projectId,

                assignedTo,

                status,

                dueDate:
                    parsedDate
            });

        // Populate assignee
        const populatedTask =
            await Task.findById(
                task._id
            ).populate(
                "assignedTo",
                "name email role"
            );

        res.status(201).json(
            populatedTask
        );

    } catch (error) {

        console.error(
            "TASK CREATE ERROR:",
            error
        );

        res.status(500).json({
            msg:
                "Task creation failed",
            error:
                error.message
        });

    }

});

// GET PROJECT TASKS
router.get(
    "/project/:id",
    auth,
    async (req, res) => {

        try {

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {
                return res.status(400).json({
                    msg:
                        "Invalid project id"
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

            if (
                !canAccessProject(
                    project,
                    req.user
                )
            ) {
                return res.status(403).json({
                    msg:
                        "Not allowed to view tasks for this project"
                });
            }

            const tasks =
                await Task.find({
                    projectId:
                        req.params.id
                })
                    .populate(
                        "assignedTo",
                        "name email role"
                    )
                    .sort({
                        dueDate: 1
                    });

            res.json(tasks);

        } catch (error) {

            console.error(
                "FETCH TASK ERROR:",
                error
            );

            res.status(500).json({
                msg:
                    "Fetching tasks failed",
                error:
                    error.message
            });

        }

    }
);

// UPDATE TASK
router.put("/:id", auth, async (req, res) => {

    try {

        if (
            !mongoose.Types.ObjectId.isValid(
                req.params.id
            )
        ) {
            return res.status(400).json({
                msg: "Invalid task id"
            });
        }

        const task =
            await Task.findById(
                req.params.id
            );

        if (!task) {
            return res.status(404).json({
                msg: "Task not found"
            });
        }

        const project =
            await Project.findById(
                task.projectId
            );

        if (
            !canAccessProject(
                project,
                req.user
            )
        ) {
            return res.status(403).json({
                msg:
                    "Not allowed to update this task"
            });
        }

        // Members only update own tasks
        if (
            req.user.role ===
                "member" &&
            task.assignedTo.toString() !==
                req.user.id
        ) {
            return res.status(403).json({
                msg:
                    "Members can only update tasks assigned to themselves"
            });
        }

        const allowedFields = [
            "title",
            "description",
            "status",
            "assignedTo",
            "dueDate"
        ];

        const updates =
            Object.fromEntries(
                Object.entries(
                    req.body
                ).filter(([key]) =>
                    allowedFields.includes(
                        key
                    )
                )
            );

        // Validate due date if updating
        if (updates.dueDate) {

            const parsedDate =
                new Date(
                    updates.dueDate
                );

            if (
                isNaN(
                    parsedDate.getTime()
                )
            ) {
                return res.status(400).json({
                    msg:
                        "Invalid due date"
                });
            }

        }

        const updatedTask =
            await Task.findByIdAndUpdate(
                req.params.id,
                updates,
                {
                    new: true,
                    runValidators: true
                }
            ).populate(
                "assignedTo",
                "name email role"
            );

        res.json(updatedTask);

    } catch (error) {

        console.error(
            "TASK UPDATE ERROR:",
            error
        );

        res.status(500).json({
            msg:
                "Task update failed",
            error:
                error.message
        });

    }

});

// DASHBOARD SUMMARY
router.get(
    "/dashboard/summary",
    auth,
    async (req, res) => {

        try {

            const projects =
                await Project.find(
                    req.user.role ===
                        "admin"
                        ? {}
                        : {
                              members:
                                  req.user.id
                          }
                ).select("_id");

            const projectIds =
                projects.map(
                    (p) => p._id
                );

            const query =
                req.user.role ===
                "admin"
                    ? {
                          projectId: {
                              $in:
                                  projectIds
                          }
                      }
                    : {
                          projectId: {
                              $in:
                                  projectIds
                          },
                          assignedTo:
                              req.user.id
                      };

            const now =
                new Date();

            const [
                total,
                todo,
                inProgress,
                done,
                overdue
            ] = await Promise.all([
                Task.countDocuments(
                    query
                ),

                Task.countDocuments({
                    ...query,
                    status:
                        "todo"
                }),

                Task.countDocuments({
                    ...query,
                    status:
                        "in-progress"
                }),

                Task.countDocuments({
                    ...query,
                    status:
                        "done"
                }),

                Task.countDocuments({
                    ...query,
                    status: {
                        $ne: "done"
                    },
                    dueDate: {
                        $lt: now
                    }
                })
            ]);

            res.json({
                total,
                todo,
                inProgress,
                done,
                overdue
            });

        } catch (error) {

            console.error(
                "DASHBOARD ERROR:",
                error
            );

            res.status(500).json({
                msg:
                    "Dashboard summary failed",
                error:
                    error.message
            });

        }

    }
);

module.exports = router;
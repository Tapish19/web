require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// DB
connectDB();

// routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/project"));
app.use("/api/tasks", require("./routes/task"));

const clientDistPath = path.resolve(__dirname, "../frontend/client/dist");
const hasClientBuild = fs.existsSync(path.join(clientDistPath, "index.html"));

if (hasClientBuild) {
  app.use(express.static(clientDistPath));

  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      name: "Project Manager API",
      status: "ok",
      docs: "Use /api/auth, /api/projects, and /api/tasks endpoints"
    });
  });
}

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);

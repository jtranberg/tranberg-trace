import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

/* GET all projects */
router.get("/", async (req, res) => {
  try {
    const { tenantId } = req.query;

    const query = tenantId ? { tenantId: String(tenantId) } : {};
    const projects = await Project.find(query).sort({ name: 1 });

    res.json(projects);
  } catch (error) {
    console.error("GET /api/projects failed:", error);
    res.status(500).json({ error: "Failed to load projects" });
  }
});

/* GET one project */
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error(`GET /api/projects/${req.params.id} failed:`, error);
    res.status(500).json({ error: "Failed to load project" });
  }
});

/* POST create project */
router.post("/", async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error("POST /api/projects failed:", error);
    res.status(400).json({ error: "Failed to create project" });
  }
});

export default router;
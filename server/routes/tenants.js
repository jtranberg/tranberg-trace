import express from "express";
import Tenant from "../models/Tenant.js";

const router = express.Router();

/* GET all tenants */
router.get("/", async (_req, res) => {
  try {
    const tenants = await Tenant.find().sort({ name: 1 });
    res.json(tenants);
  } catch (error) {
    console.error("GET /api/tenants failed:", error);
    res.status(500).json({ error: "Failed to load tenants" });
  }
});

/* GET one tenant */
router.get("/:id", async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    res.json(tenant);
  } catch (error) {
    console.error(`GET /api/tenants/${req.params.id} failed:`, error);
    res.status(500).json({ error: "Failed to load tenant" });
  }
});

/* POST create tenant */
router.post("/", async (req, res) => {
  try {
    const tenant = new Tenant(req.body);
    await tenant.save();
    res.status(201).json(tenant);
  } catch (error) {
    console.error("POST /api/tenants failed:", error);
    res.status(400).json({ error: "Failed to create tenant" });
  }
});

export default router;
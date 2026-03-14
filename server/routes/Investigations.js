import express from "express";
import Investigation from "../models/Investigation.js";




const router = express.Router();

// router.get("/seed", async (req, res) => {
//   try {
//     const test = await Investigation.create({
//       title: "TRACE system test",
//       description: "First investigation stored in Mongo",
//       severity: "medium",
//       layer: "api",
//       environment: "local",
//       tags: ["test"]
//     });

//     res.json(test);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Seed failed" });
//   }
// });

/* GET all investigations */
router.get("/", async (_req, res) => {
  try {
    const investigations = await Investigation.find().sort({ updatedAt: -1 });
    res.json(investigations);
  } catch (error) {
    console.error("GET /api/investigations failed:", error);
    res.status(500).json({ error: "Failed to load investigations" });
  }
});

/* GET one investigation */
router.get("/:id", async (req, res) => {
  try {
    const item = await Investigation.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Investigation not found" });
    }

    res.json(item);
  } catch (error) {
    console.error(`GET /api/investigations/${req.params.id} failed:`, error);
    res.status(500).json({ error: "Failed to load investigation" });
  }
});

/* POST create investigation */
router.post("/", async (req, res) => {
  try {
    const item = new Investigation(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error("POST /api/investigations failed:", error);
    res.status(400).json({ error: "Failed to create investigation" });
  }
});

/* PUT update investigation */
router.put("/:id", async (req, res) => {
  try {
    const item = await Investigation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ error: "Investigation not found" });
    }

    res.json(item);
  } catch (error) {
    console.error(`PUT /api/investigations/${req.params.id} failed:`, error);
    res.status(400).json({ error: "Failed to update investigation" });
  }
});

/* DELETE investigation */
router.delete("/:id", async (req, res) => {
  try {
    const item = await Investigation.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Investigation not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/investigations/${req.params.id} failed:`, error);
    res.status(500).json({ error: "Failed to delete investigation" });
  }
});

export default router;
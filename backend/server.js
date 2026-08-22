const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// DATABASE
// ===============================

const db = new Database("crisisgrid.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    people INTEGER DEFAULT 0,
    severity TEXT DEFAULT 'MEDIUM',
    risk_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

console.log("✅ SQLite database connected");

// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "CrisisGrid API is running 🚨",
    database: "SQLite connected",
    status: "online"
  });
});

// ===============================
// GET ALL INCIDENTS
// ===============================

app.get("/api/incidents", (req, res) => {
  try {
    const incidents = db
      .prepare(`
        SELECT *
        FROM incidents
        ORDER BY created_at DESC
      `)
      .all();

    res.json(incidents);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch incidents"
    });
  }
});

// ===============================
// CREATE INCIDENT
// ===============================

app.post("/api/incidents", (req, res) => {
  try {
    const {
      type,
      location,
      description,
      people
    } = req.body;

    if (!type || !location || !description) {
      return res.status(400).json({
        message: "Type, location and description are required"
      });
    }

    const peopleAffected = Number(people) || 0;

    let severity = "MEDIUM";
    let riskScore = 55;

    if (
      type === "Industrial Fire" ||
      type === "Building Collapse" ||
      peopleAffected >= 10
    ) {
      severity = "CRITICAL";
      riskScore = 94;
    } else if (
      type === "Flood" ||
      type === "Road Accident"
    ) {
      severity = "HIGH";
      riskScore = 78;
    }

    const result = db
      .prepare(`
        INSERT INTO incidents
        (
          type,
          location,
          description,
          people,
          severity,
          risk_score,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        type,
        location,
        description,
        peopleAffected,
        severity,
        riskScore,
        "ACTIVE"
      );

    const newIncident = db
      .prepare(`
        SELECT *
        FROM incidents
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    console.log("🚨 New incident saved:", newIncident);

    res.status(201).json({
      message: "Incident successfully analyzed and saved",
      incident: newIncident
    });

  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Failed to save incident"
    });
  }
});

// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚨 CrisisGrid API running on http://localhost:${PORT}`);
});
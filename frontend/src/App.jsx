import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [incidents, setIncidents] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [incident, setIncident] = useState({
    type: "Industrial Fire",
    location: "Sector 04",
    description: "",
    people: "10",
  });

  // LOAD INCIDENTS FROM SQLITE
  const fetchIncidents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/incidents`);

      if (!response.ok) {
        throw new Error("Failed to load incidents");
      }

      const data = await response.json();
      setIncidents(data);
    } catch (err) {
      console.error("Incident loading error:", err);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // FORM INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setIncident((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // SUBMIT INCIDENT
  const handleAnalyze = async () => {
    if (!incident.description.trim()) {
      setError("Please describe the incident first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incident),
      });

      if (!response.ok) {
        throw new Error("Backend returned an error");
      }

      const data = await response.json();

      console.log("CrisisGrid response:", data);

      setShowAnalysis(true);

      // Reload incidents from SQLite
      await fetchIncidents();
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to CrisisGrid server. Make sure backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  const openReport = () => {
    setShowReport(true);
    setShowAnalysis(false);
    setError("");
  };

  const closeReport = () => {
    setShowReport(false);
    setShowAnalysis(false);
    setError("");
  };

  const dispatchResponse = () => {
    alert("🚨 Response plan dispatched successfully!");
    closeReport();
  };

  const criticalCount = incidents.filter(
    (item) => item.severity === "CRITICAL"
  ).length;

  const highCount = incidents.filter(
    (item) => item.severity === "HIGH"
  ).length;

  const averageRisk =
    incidents.length > 0
      ? Math.round(
          incidents.reduce(
            (sum, item) => sum + Number(item.risk_score || 0),
            0
          ) / incidents.length
        )
      : 0;

  return (
    <div className="app">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="logo">
          <span>✦</span>
          CrisisGrid
        </div>

        <div className="nav-status">
          <span className="status-dot"></span>
          SYSTEM ONLINE
        </div>

      </nav>

      {/* DASHBOARD */}

      <main className="dashboard">

        {/* HEADER */}

        <div className="page-header">

          <div>

            <p className="eyebrow">
              EMERGENCY RESPONSE COMMAND CENTER
            </p>

            <h1>
              Situation Overview
            </h1>

            <p className="subtitle">
              AI-powered incident detection, prioritization
              and resource coordination.
            </p>

          </div>

          <button
            className="report-btn"
            onClick={openReport}
          >
            + Report Incident
          </button>

        </div>

        {/* STATS */}

        <section className="stats-grid">

          <div className="stat-card critical">

            <p>
              CRITICAL INCIDENTS
            </p>

            <h2>
              {String(criticalCount).padStart(2, "0")}
            </h2>

            <span>
              AI-prioritized emergencies
            </span>

          </div>

          <div className="stat-card">

            <p>
              ACTIVE INCIDENTS
            </p>

            <h2>
              {String(incidents.length).padStart(2, "0")}
            </h2>

            <span>
              Currently monitored
            </span>

          </div>

          <div className="stat-card">

            <p>
              HIGH PRIORITY
            </p>

            <h2>
              {String(highCount).padStart(2, "0")}
            </h2>

            <span>
              Requiring attention
            </span>

          </div>

          <div className="stat-card">

            <p>
              AVG RISK SCORE
            </p>

            <h2>
              {averageRisk}
            </h2>

            <span>
              AI assessment
            </span>

          </div>

        </section>

        {/* MAIN CONTENT */}

        <section className="content-grid">

          {/* MAP */}

          <div className="map-panel">

            <div className="panel-header">

              <div>

                <h3>
                  Live Incident Map
                </h3>

                <p>
                  Real-time emergency activity
                </p>

              </div>

              <span className="live-badge">
                ● LIVE
              </span>

            </div>

            <div className="map">

              <div className="map-grid"></div>

              {/* DYNAMIC MARKERS */}

              {incidents.slice(0, 6).map((item, index) => (

                <div
                  key={item.id}
                  className={`incident-marker marker-${(index % 3) + 1}`}
                  title={`${item.type} - ${item.location}`}
                >
                  !
                </div>

              ))}

              {incidents.length === 0 && (
                <>
                  <div className="incident-marker marker-1">
                    !
                  </div>

                  <div className="incident-marker marker-2">
                    !
                  </div>

                  <div className="incident-marker marker-3">
                    !
                  </div>
                </>
              )}

              <div className="map-label label-1">
                Sector 04
              </div>

              <div className="map-label label-2">
                Central Zone
              </div>

              <div className="map-label label-3">
                Industrial Area
              </div>

            </div>

          </div>

          {/* INCIDENT LIST */}

          <div className="incident-panel">

            <div className="panel-header">

              <div>

                <h3>
                  Priority Incidents
                </h3>

                <p>
                  Live data from CrisisGrid
                </p>

              </div>

              <span className="count">
                {incidents.length}
              </span>

            </div>

            <div className="incident-list">

              {incidents.length === 0 ? (

                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: "#667184",
                  }}
                >
                  No incidents reported yet.
                </div>

              ) : (

                incidents.slice(0, 6).map((item) => (

                  <div
                    className="incident"
                    key={item.id}
                  >

                    <div
                      className={`severity ${
                        item.severity === "CRITICAL"
                          ? "critical-bg"
                          : "high-bg"
                      }`}
                    >
                      {item.severity || "HIGH"}
                    </div>

                    <div className="incident-info">

                      <strong>
                        {item.type}
                      </strong>

                      <span>
                        {item.location}
                      </span>

                    </div>

                    <b>
                      {item.risk_score || 0}
                    </b>

                  </div>

                ))

              )}

            </div>

          </div>

        </section>

        {/* AI RESPONSE */}

        <section className="ai-panel">

          <div className="ai-icon">
            ✦
          </div>

          <div>

            <p className="eyebrow">
              AI RESPONSE ENGINE
            </p>

            <h3>
              Intelligent Emergency Prioritization
            </h3>

            <p>
              CrisisGrid analyzes incoming incidents,
              calculates risk and recommends response
              actions for emergency teams.
            </p>

          </div>

          <button className="action-btn">
            View Response Plan →
          </button>

        </section>

      </main>

      {/* REPORT MODAL */}

      {showReport && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>

                <p className="eyebrow">
                  NEW EMERGENCY REPORT
                </p>

                <h2>
                  Report Incident
                </h2>

              </div>

              <button
                className="close-btn"
                onClick={closeReport}
              >
                ×
              </button>

            </div>

            {/* TYPE */}

            <label htmlFor="type">
              Incident Type
            </label>

            <select
              id="type"
              name="type"
              value={incident.type}
              onChange={handleChange}
            >

              <option>
                Industrial Fire
              </option>

              <option>
                Building Collapse
              </option>

              <option>
                Flood
              </option>

              <option>
                Road Accident
              </option>

              <option>
                Medical Emergency
              </option>

              <option>
                Chemical Leak
              </option>

              <option>
                Other
              </option>

            </select>

            {/* LOCATION */}

            <label htmlFor="location">
              Location
            </label>

            <input
              id="location"
              name="location"
              value={incident.location}
              onChange={handleChange}
              placeholder="Enter location"
            />

            {/* PEOPLE */}

            <label htmlFor="people">
              People Affected
            </label>

            <input
              id="people"
              name="people"
              type="number"
              min="0"
              value={incident.people}
              onChange={handleChange}
              placeholder="Number of people"
            />

            {/* DESCRIPTION */}

            <label htmlFor="description">
              Incident Description
            </label>

            <textarea
              id="description"
              name="description"
              value={incident.description}
              onChange={handleChange}
              placeholder="Describe what happened..."
              rows="5"
            />

            {/* ERROR */}

            {error && (

              <div
                style={{
                  marginTop: "12px",
                  padding: "10px",
                  borderRadius: "7px",
                  background: "rgba(255,65,65,0.1)",
                  border: "1px solid rgba(255,65,65,0.3)",
                  color: "#ff6565",
                  fontSize: "11px",
                }}
              >
                {error}
              </div>

            )}

            {/* ANALYZE */}

            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading}
            >

              {loading
                ? "Analyzing..."
                : "✦ Analyze With AI"}

            </button>

            {/* ANALYSIS */}

            {showAnalysis && (

              <div className="analysis-result">

                <div className="analysis-title">

                  <span>
                    ✦
                  </span>

                  AI INCIDENT ANALYSIS

                </div>

                <div className="analysis-grid">

                  <div>

                    <small>
                      CLASSIFICATION
                    </small>

                    <strong>
                      {incident.type}
                    </strong>

                  </div>

                  <div>

                    <small>
                      SEVERITY
                    </small>

                    <strong className="danger">
                      CRITICAL
                    </strong>

                  </div>

                  <div>

                    <small>
                      RISK SCORE
                    </small>

                    <strong>
                      94 / 100
                    </strong>

                  </div>

                  <div>

                    <small>
                      PEOPLE AFFECTED
                    </small>

                    <strong>
                      {incident.people}
                    </strong>

                  </div>

                </div>

                <div className="recommendation">

                  <small>
                    AI RECOMMENDATION
                  </small>

                  <p>
                    🚒 Deploy 2 Fire Units
                  </p>

                  <p>
                    🚑 Dispatch 1 Ambulance
                  </p>

                  <p>
                    🏥 Alert nearest hospital
                  </p>

                  <p>
                    🚨 Establish emergency perimeter
                  </p>

                </div>

                <button
                  className="dispatch-btn"
                  onClick={dispatchResponse}
                >
                  🚨 Dispatch Response Plan
                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default App;
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [incidents, setIncidents] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [incident, setIncident] = useState({
    type: "Industrial Fire",
    location: "Sector 04",
    description: "",
    people: "10",
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    try {
      const res = await fetch(`${API}/api/incidents`);

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(e) {
    setIncident({
      ...incident,
      [e.target.name]: e.target.value,
    });
  }

  async function analyzeIncident() {
    if (!incident.description.trim()) {
      setError("Please describe the incident.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incident),
      });

      if (!res.ok) {
        throw new Error("Backend error");
      }

      const data = await res.json();

      console.log("CrisisGrid Analysis:", data);

      setAnalysis(data.analysis);

      await loadIncidents();
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to backend. Make sure server.js is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  function openReport() {
    setShowReport(true);
    setAnalysis(null);
    setError("");
  }

  function closeReport() {
    setShowReport(false);
    setAnalysis(null);
    setError("");
  }

  function dispatchResponse() {
    alert("🚨 Response plan dispatched successfully!");
    closeReport();
  }

  const critical = incidents.filter(
    (i) => i.severity === "CRITICAL"
  ).length;

  const high = incidents.filter(
    (i) => i.severity === "HIGH"
  ).length;

  const averageRisk =
    incidents.length > 0
      ? Math.round(
          incidents.reduce(
            (sum, i) => sum + Number(i.risk_score || 0),
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

      <main className="dashboard">

        {/* HEADER */}

        <div className="page-header">
          <div>
            <p className="eyebrow">
              EMERGENCY RESPONSE COMMAND CENTER
            </p>

            <h1>Situation Overview</h1>

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
            <p>CRITICAL INCIDENTS</p>

            <h2>
              {String(critical).padStart(2, "0")}
            </h2>

            <span>
              AI-prioritized emergencies
            </span>
          </div>

          <div className="stat-card">
            <p>ACTIVE INCIDENTS</p>

            <h2>
              {String(incidents.length).padStart(2, "0")}
            </h2>

            <span>
              Currently monitored
            </span>
          </div>

          <div className="stat-card">
            <p>HIGH PRIORITY</p>

            <h2>
              {String(high).padStart(2, "0")}
            </h2>

            <span>
              Requiring attention
            </span>
          </div>

          <div className="stat-card">
            <p>AVG RISK SCORE</p>

            <h2>
              {averageRisk}
            </h2>

            <span>
              AI assessment
            </span>
          </div>

        </section>

        {/* MAIN */}

        <section className="content-grid">

          {/* MAP */}

          <div className="map-panel">

            <div className="panel-header">
              <div>
                <h3>Live Incident Map</h3>

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

              {incidents.length > 0 ? (
                incidents
                  .slice(0, 3)
                  .map((item, index) => (
                    <div
                      key={item.id}
                      className={`incident-marker marker-${
                        index + 1
                      }`}
                      title={`${item.type} - ${item.location}`}
                    >
                      !
                    </div>
                  ))
              ) : (
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

          {/* INCIDENTS */}

          <div className="incident-panel">

            <div className="panel-header">

              <div>
                <h3>
                  Priority Incidents
                </h3>

                <p>
                  Live database records
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
                incidents
                  .slice(0, 6)
                  .map((item) => (
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
                        {item.severity}
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
                        {item.risk_score}
                      </b>

                    </div>
                  ))
              )}

            </div>
          </div>

        </section>

        {/* AI PANEL */}

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
              CrisisGrid converts emergency reports
              into explainable risk scores and response
              plans.
            </p>

          </div>

          <button className="action-btn">
            AI ENGINE ACTIVE →
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

            <label>
              Incident Type
            </label>

            <select
              name="type"
              value={incident.type}
              onChange={handleChange}
            >
              <option>Industrial Fire</option>
              <option>Building Collapse</option>
              <option>Flood</option>
              <option>Road Accident</option>
              <option>Medical Emergency</option>
              <option>Chemical Leak</option>
              <option>Other</option>
            </select>

            <label>
              Location
            </label>

            <input
              name="location"
              value={incident.location}
              onChange={handleChange}
              placeholder="Enter location"
            />

            <label>
              People Affected
            </label>

            <input
              name="people"
              type="number"
              min="0"
              value={incident.people}
              onChange={handleChange}
            />

            <label>
              Incident Description
            </label>

            <textarea
              name="description"
              value={incident.description}
              onChange={handleChange}
              placeholder="Describe what happened..."
              rows="5"
            />

            {error && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px",
                  borderRadius: "7px",
                  background:
                    "rgba(255,65,65,0.1)",
                  border:
                    "1px solid rgba(255,65,65,0.3)",
                  color: "#ff6565",
                  fontSize: "11px",
                }}
              >
                {error}
              </div>
            )}

            <button
              className="analyze-btn"
              onClick={analyzeIncident}
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "✦ Analyze With AI"}
            </button>

            {/* REAL ANALYSIS */}

            {analysis && (
              <div className="analysis-result">

                <div className="analysis-title">
                  <span>✦</span>
                  CRISISGRID AI ANALYSIS
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
                      {analysis.severity}
                    </strong>
                  </div>

                  <div>
                    <small>
                      RISK SCORE
                    </small>

                    <strong>
                      {analysis.riskScore}/100
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

                {/* RESOURCES */}

                <div className="recommendation">

                  <small>
                    RECOMMENDED RESPONSE
                  </small>

                  {analysis.resources.fireUnits > 0 && (
                    <p>
                      🚒 Fire Units:{" "}
                      {analysis.resources.fireUnits}
                    </p>
                  )}

                  {analysis.resources.ambulances > 0 && (
                    <p>
                      🚑 Ambulances:{" "}
                      {analysis.resources.ambulances}
                    </p>
                  )}

                  {analysis.resources.policeUnits > 0 && (
                    <p>
                      👮 Police Units:{" "}
                      {analysis.resources.policeUnits}
                    </p>
                  )}

                  {analysis.hospitalAlert && (
                    <p>
                      🏥 Hospital Alert: REQUIRED
                    </p>
                  )}

                  {analysis.evacuationRequired && (
                    <p>
                      🚨 Evacuation: REQUIRED
                    </p>
                  )}

                  {analysis.emergencyPerimeter && (
                    <p>
                      🚧 Emergency Perimeter: REQUIRED
                    </p>
                  )}

                </div>

                {/* REASONS */}

                {analysis.reasons?.length > 0 && (
                  <div className="recommendation">

                    <small>
                      WHY THIS SCORE?
                    </small>

                    {analysis.reasons
                      .slice(0, 4)
                      .map((reason, index) => (
                        <p key={index}>
                          • {reason}
                        </p>
                      ))}

                  </div>
                )}

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
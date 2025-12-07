import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://127.0.0.1:5000"; // change later when you deploy backend

const EXAMPLES = [
  "Government announces free iPhone for every citizen",
  "Scientists discover new planet similar to Earth",
  "New hospital opens in the city to serve poor families",
  "Breaking: Prime minister resigns after secret alien invasion",
];

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Load history from localStorage on first load
  useEffect(() => {
    const saved = localStorage.getItem("fakeNewsHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save history whenever it changes
  useEffect(() => {
    localStorage.setItem("fakeNewsHistory", JSON.stringify(history));
  }, [history]);

  const handleCheck = async () => {
    if (!text.trim()) {
      setError("Please enter some news text to analyze.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(`${API_URL}/predict`, { text });

      setResult(res.data);

      // add to history (newest at top)
      const newEntry = {
        id: Date.now(),
        label: res.data.label,
        probability: res.data.probability,
        text: res.data.input_text,
        time: new Date().toLocaleString(),
      };
      setHistory((prev) => [newEntry, ...prev].slice(0, 10)); // keep last 10
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Make sure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setText(example);
    setResult(null);
    setError("");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("fakeNewsHistory");
  };

  return (
    <div className="page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">📰 Fake News Detector</div>
        <div className="nav-right">
          <span className="tag">ML + Flask + React</span>
        </div>
      </header>

      {/* Main content */}
      <main className="app">
        <div className="card main-card">
          <h1>Check if a news article looks suspicious</h1>
          <p className="subtitle">
            Paste a news headline or short article below. The machine learning model
            will analyze it and predict whether it is <b>FAKE</b> or <b>REAL</b>.
          </p>

          <textarea
            rows={7}
            placeholder="Type or paste the news content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button onClick={handleCheck} disabled={loading}>
            {loading ? (
              <span className="spinner-wrapper">
                <span className="spinner" /> Analyzing...
              </span>
            ) : (
              "Check News"
            )}
          </button>

          {error && <p className="error">{error}</p>}

          {result && (
            <div className="result">
              <h2>
                Result:{" "}
                <span className={result.label === "FAKE" ? "fake" : "real"}>
                  {result.label}
                </span>
              </h2>
              <p>Confidence: {Math.round(result.probability * 100)}%</p>

              <div className="input-preview">
                <h4>Input text analyzed:</h4>
                <p>{result.input_text}</p>
              </div>
            </div>
          )}

          {/* Examples */}
          <div className="examples">
            <h3>Try some examples</h3>
            <div className="example-chips">
              {EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  className="chip"
                  onClick={() => handleExampleClick(ex)}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History card */}
        <aside className="card history-card">
          <div className="history-header">
            <h3>History</h3>
            {history.length > 0 && (
              <button className="small-btn" onClick={clearHistory}>
                Clear
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="empty-history">No checks yet. Analyze some news to see history.</p>
          ) : (
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  <div className="history-top">
                    <span
                      className={`pill ${
                        item.label === "FAKE" ? "fake-pill" : "real-pill"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="time">{item.time}</span>
                  </div>
                  <p className="history-text">{item.text}</p>
                  <span className="history-conf">
                    Confidence: {Math.round(item.probability * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          Built with ❤️ using <b>Python (Flask)</b>, <b>scikit-learn</b> and <b>React</b>.  
          Trained on public Fake & True news datasets.
        </p>
      </footer>
    </div>
  );
}

export default App;

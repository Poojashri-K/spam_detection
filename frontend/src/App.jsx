import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [metrics, setMetrics] = useState([])
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [metricsError, setMetricsError] = useState('')
  const [expandedDetails, setExpandedDetails] = useState({})

  useEffect(() => {
    async function loadMetrics() {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/metrics')
        if (!response.ok) {
          throw new Error('Model performance data is currently unavailable.')
        }
        const data = await response.json()
        setMetrics(data)
      } catch {
        setMetricsError('Unable to load model performance. Please try again later.')
      } finally {
        setMetricsLoading(false)
      }
    }

    loadMetrics()
  }, [])

  async function handleAnalyze() {
    if (!message.trim()) {
      setError('Please enter a message to analyze.')
      setAnalysis(null)
      return
    }

    setLoading(true)
    setError('')
    setAnalysis(null)

    try {
      const response = await fetch('http://127.0.0.1:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'The message could not be analyzed.')
      }

      setAnalysis(data)
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'Could not connect to the analysis service. Make sure the backend is running, then try again.'
          : requestError.message || 'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setMessage('')
    setAnalysis(null)
    setError('')
  }

  return (
    <main className="page-shell">
      <div className="app-container">
        <header className="topbar">
          <a className="brand" href="/" aria-label="MessageGuard home">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3 20 6v5.5c0 4.8-3.3 8-8 9.5-4.7-1.5-8-4.7-8-9.5V6l8-3Z" />
                <path d="m8.5 12 2.2 2.2 4.8-5" />
              </svg>
            </span>
            <span>MessageGuard</span>
          </a>
          <span className="project-label">ML Project</span>
        </header>

        <section className="hero-section" aria-labelledby="page-title">
          <div className="eyebrow"><span className="status-dot" /> MESSAGE SECURITY TOOL</div>
          <h1 id="page-title">ML-Based Scam Message Detection</h1>
          <p className="intro">
            This machine learning system analyzes suspicious messages and highlights
            signals that may indicate a scam.
          </p>

          <div className="analysis-card">
            <div className="card-heading">
              <div>
                <label htmlFor="message-input">Message to analyze</label>
                <p>Paste the full text of a message, including any links.</p>
              </div>
              <span className="input-badge">TEXT ANALYSIS</span>
            </div>

            <textarea
              id="message-input"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value)
                if (error) setError('')
              }}
              placeholder="Example: Your account needs attention. Verify your details at..."
              rows={8}
            />

            <div className="card-footer">
              <span className="character-count">{message.length} characters</span>
              <div className="action-buttons">
                <button className="clear-button" type="button" onClick={handleClear} disabled={loading}>
                  Clear
                </button>
                <button
                  className="analyze-button"
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Analyze Message'}
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M4 10h12M10 4l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {error && <p className="feedback-message error-message" role="alert">{error}</p>}
          {loading && <p className="feedback-message loading-message" role="status">Analyzing your message...</p>}

          {analysis && (
            <section
              className={`result-card prediction-${analysis.prediction.toLowerCase()}`}
              aria-live="polite"
              aria-labelledby="result-heading"
            >
              <div className="result-header">
                <div>
                  <span className="result-kicker">ANALYSIS COMPLETE</span>
                  <h2 id="result-heading">Message analysis result</h2>
                </div>
                <span className={`severity-badge severity-${analysis.severity.toLowerCase()}`}>
                  {analysis.severity} threat severity
                </span>
              </div>
              <div className="result-summary">
                <span className="result-label">Prediction</span>
                <strong className={`prediction-value prediction-value-${analysis.prediction.toLowerCase()}`}>
                  {analysis.prediction}
                </strong>
                <span className="confidence-value">
                  Confidence: {Number(analysis.confidence).toFixed(2)}%
                </span>
                <span className="model-used">Model used: SVM</span>
              </div>
              <div className="reason-list">
                <h3>Explanation / Reasons</h3>
                {analysis.reasons?.length > 0 ? (
                  <ul>
                    {analysis.reasons.map((reason, index) => <li key={`${reason}-${index}`}>{reason}</li>)}
                  </ul>
                ) : (
                  <p className="no-reasons">No specific warning signs were detected.</p>
                )}
              </div>
            </section>
          )}

          <p className="privacy-note">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2.5 16 5v4.1c0 3.6-2.5 6-6 7.2-3.5-1.2-6-3.6-6-7.2V5l6-2.5Z" />
              <path d="m7.5 9.8 1.7 1.7 3.5-3.6" />
            </svg>
            Your message is analyzed for educational purposes.
          </p>
        </section>

        <section className="metrics-section" aria-labelledby="metrics-heading">
          <div className="metrics-heading">
            <div>
              <span className="result-kicker">MODEL EVALUATION</span>
              <h2 id="metrics-heading">Model Performance</h2>
            </div>
            <p>Test set evaluation metrics</p>
          </div>

          {metricsLoading ? (
            <p className="metrics-status" role="status">Loading model performance...</p>
          ) : metricsError ? (
            <p className="metrics-error" role="alert">{metricsError}</p>
          ) : (
            <>
              <div className="chart-legend" aria-label="Metric legend">
                <span><i className="legend-swatch accuracy-swatch" />Accuracy</span>
                <span><i className="legend-swatch precision-swatch" />Precision</span>
                <span><i className="legend-swatch recall-swatch" />Recall</span>
                <span><i className="legend-swatch f1-swatch" />F1-score</span>
              </div>
              <div className="chart-frame" role="img" aria-label="Grouped bar chart comparing model accuracy, precision, recall, and F1-score from zero to one hundred percent">
                <div className="chart-y-axis" aria-hidden="true">
                  {[100, 75, 50, 25, 0].map((tick) => <span key={tick}>{tick}%</span>)}
                </div>
                <div className="chart-content">
                  <div className="chart-plot">
                    {[100, 75, 50, 25, 0].map((tick) => (
                      <div className="chart-gridline" key={tick} style={{ bottom: `${tick}%` }} />
                    ))}
                    <div className="chart-model-groups">
                      {metrics.map((metric) => {
                        const values = [
                          { name: 'Accuracy', field: 'accuracy', className: 'accuracy-bar' },
                          { name: 'Precision', field: 'precision', className: 'precision-bar' },
                          { name: 'Recall', field: 'recall', className: 'recall-bar' },
                          { name: 'F1-score', field: 'f1_score', className: 'f1-bar' },
                        ]

                        return (
                          <div className="chart-model-group" key={metric.Model}>
                            <div className="chart-bars">
                              {values.map((value) => {
                                const percentage = Number(metric[value.field]) * 100
                                const displayedPercentage = percentage.toFixed(2)

                                return (
                                  <div className="chart-bar-column" key={value.field}>
                                    <div
                                      className={`chart-bar ${value.className}`}
                                      style={{ height: `${Math.min(100, Math.max(0, percentage))}%` }}
                                      title={`${value.name}: ${displayedPercentage}%`}
                                      aria-label={`${metric.Model} ${value.name}: ${displayedPercentage}%`}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                            <span className="chart-model-label">{metric.Model}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {!metricsLoading && !metricsError && (
            <div className="confusion-section" aria-labelledby="confusion-heading">
              <div className="confusion-heading">
                <h3 id="confusion-heading">Confusion Matrix</h3>
                <p>Correct vs incorrect predictions made on the test set.</p>
              </div>
              <div className="breakdown-grid">
                {metrics.map((item) => {
                  const matrix = item.confusion_matrix
                  if (!matrix || matrix.length !== 2) return null
                  const trueNegative = matrix[0][0]
                  const falsePositive = matrix[0][1]
                  const falseNegative = matrix[1][0]
                  const truePositive = matrix[1][1]
                  const totalCorrect = trueNegative + truePositive
                  const totalIncorrect = falsePositive + falseNegative
                  const totalSamples = totalCorrect + totalIncorrect
                  const correctPercentage = totalSamples ? (totalCorrect / totalSamples) * 100 : 0
                  const detailsId = `details-${item.Model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

                  return (
                    <article className="breakdown-card" key={`matrix-${item.Model}`}>
                      <h4>{item.Model}</h4>
                      <div className="breakdown-summary">
                        <div className="summary-stat correct-stat">
                          <span>Correct predictions</span>
                          <strong>{totalCorrect}</strong>
                        </div>
                        <div className="summary-stat incorrect-stat">
                          <span>Incorrect predictions</span>
                          <strong>{totalIncorrect}</strong>
                        </div>
                      </div>
                      <div
                        className="prediction-bar"
                        role="img"
                        aria-label={`${totalCorrect} correct predictions and ${totalIncorrect} incorrect predictions out of ${totalSamples} samples`}
                      >
                        <span className="prediction-bar-correct" style={{ width: `${correctPercentage}%` }} />
                        <span className="prediction-bar-incorrect" style={{ width: `${100 - correctPercentage}%` }} />
                      </div>
                      <div className="prediction-bar-legend" aria-hidden="true">
                        <span><i className="bar-legend-correct" />Correct</span>
                        <span><i className="bar-legend-incorrect" />Incorrect</span>
                      </div>
                      <div className="breakdown-totals">
                        <span>Total samples</span>
                        <strong>{totalSamples}</strong>
                      </div>
                      <button
                        className="details-button"
                        type="button"
                        aria-expanded={Boolean(expandedDetails[item.Model])}
                        aria-controls={detailsId}
                        onClick={() => setExpandedDetails((current) => ({
                          ...current,
                          [item.Model]: !current[item.Model],
                        }))}
                      >
                        {expandedDetails[item.Model] ? 'Hide details' : 'Details'}
                      </button>
                      {expandedDetails[item.Model] && (
                        <div className="breakdown-details" id={detailsId}>
                          <div className="detail-group">
                            <h5>Ham messages</h5>
                            <p><span>Correctly identified as Ham</span><strong>{trueNegative}</strong></p>
                            <p><span>Incorrectly marked as Spam</span><strong>{falsePositive}</strong></p>
                          </div>
                          <div className="detail-group">
                            <h5>Spam messages</h5>
                            <p><span>Correctly identified as Spam</span><strong>{truePositive}</strong></p>
                            <p><span>Missed as Ham</span><strong>{falseNegative}</strong></p>
                          </div>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        <footer className="page-footer">
          <span>MessageGuard <span className="footer-divider">|</span> Scam awareness project</span>
          <span>Pause. Check. Stay safe.</span>
        </footer>
      </div>
    </main>
  )
}

export default App

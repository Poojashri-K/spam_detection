import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import AnalyzePage from './pages/AnalyzePage.jsx'

const stats = [
  { value: '3', label: 'ML Models', accent: 'blue' },
  { value: '20K', label: 'Combined TF-IDF Features', accent: 'purple' },
  { value: '98.60%', label: 'SVM Accuracy', accent: 'cyan' },
  { value: '97.12%', label: 'SVM F1 Score', accent: 'orange' },
]

const featureCards = [
  { icon: '🛡️', title: 'Spam Detection', description: 'Detect suspicious SMS using TF-IDF features and supervised ML models.', accent: 'blue' },
  { icon: '⚠️', title: 'Threat Severity', description: 'Assess risk intensity using urgency cues and scam pattern signals.', accent: 'orange' },
  { icon: '📘', title: 'Explainable Results', description: 'Present clear reasons behind each prediction for better trust and understanding.', accent: 'purple' },
  { icon: '📊', title: 'Model Comparison', description: 'Compare model performance across logistic regression, Naive Bayes, and SVM.', accent: 'cyan' },
]

const pipelineSteps = [
  { step: '01', title: 'User Message', text: 'An SMS or text is entered by the user for classification and risk assessment.' },
  { step: '02', title: 'Text Preprocessing', text: 'Lowercasing, URL masking, number normalization, and cleanup reduce noisy text input.' },
  { step: '03', title: 'Word + Character TF-IDF', text: 'Features are extracted from both word and character n-grams to capture semantic and stylistic signals.' },
  { step: '04', title: 'Logistic Regression', text: 'One classifier learns the linear decision boundary for SMS classification.' },
  { step: '05', title: 'Multinomial Naive Bayes', text: 'This model is efficient for high-dimensional text with strong probability-based scoring.' },
  { step: '06', title: 'SVM', text: 'Support vector machines optimize the margin for robust classification on sparse TF-IDF features.' },
  { step: '07', title: 'Model Prediction', text: 'The selected model predicts whether the message is ham or spam.' },
  { step: '08', title: 'Threat Severity Analysis', text: 'The content is further evaluated for urgency, scam cues, and security risk level.' },
  { step: '09', title: 'Explainable Result', text: 'The system presents confidence and reasons so the final decision is transparent and interpretable.' },
]

const modelResults = [
  {
    model: 'Logistic Regression',
    accuracy: 98.08,
    precision: 98.26,
    recall: 93.84,
    f1: 96.00,
    highlight: false,
  },
  {
    model: 'Multinomial Naive Bayes',
    accuracy: 97.09,
    precision: 94.71,
    recall: 93.36,
    f1: 94.03,
    highlight: false,
  },
  {
    model: 'SVM',
    accuracy: 98.60,
    precision: 98.30,
    recall: 95.97,
    f1: 97.12,
    highlight: true,
  },
]

function HomePage() {
  return (
    <div className="page-section">
      <section className="hero-section" aria-labelledby="home-title">
        <div className="eyebrow"><span className="status-dot" /> Message Security Project</div>
        <h1 id="home-title">
          <span className="title-line">ML-Based</span>
          <span className="title-line highlight-line">Spam Message Detection</span>
          <span className="title-line">&amp; Threat Severity Analysis</span>
        </h1>
        <p className="intro">
          Classify SMS as Ham or Spam and assess threat severity using explainable machine learning.
        </p>
        <div className="hero-actions">
          <Link to="/analyze" className="primary-button">Analyze Message</Link>
          <Link to="/how-it-works" className="secondary-button">Explore How It Works</Link>
        </div>

        <div className="stats-grid" aria-label="Project statistics">
          {stats.map((stat) => (
            <article className={`stat-card stat-card-${stat.accent}`} key={stat.label}>
              <span className="stat-icon" aria-hidden="true">{stat.accent === 'blue' ? '✦' : stat.accent === 'purple' ? '▣' : stat.accent === 'cyan' ? '◌' : '⚑'}</span>
              <span className="value">{stat.value}</span>
              <span className="label">{stat.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section-header" aria-labelledby="why-it-matters-title">
        <h2 id="why-it-matters-title">Why This Matters</h2>
        <p>
          Spam and scam messages continue to evolve, often using urgency, impersonation, and misleading links to affect
          users. A practical machine learning system can identify suspicious patterns early and help reduce risk.
        </p>
      </section>

      <div className="feature-grid">
        {featureCards.map((feature) => (
          <article className={`feature-card feature-card-${feature.accent}`} key={feature.title}>
            <div className="icon" aria-hidden="true">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

function HowItWorksPage() {
  return (
    <div className="page-section">
      <section className="section-header" aria-labelledby="how-it-works-title">
        <h2 id="how-it-works-title">How the system works</h2>
        <p>
          The platform follows a practical text-classification pipeline, combining feature extraction and multiple ML models
          to classify spam and assess threat intensity in a fast, explainable workflow.
        </p>
      </section>

      <div className="pipeline-layout">
        <div className="pipeline-row">
          {pipelineSteps.slice(0, 3).map((step) => (
            <article className="pipeline-step" key={step.step}>
              <span className="step-label">{step.step}</span>
              <h4>{step.title}</h4>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="pipeline-arrow">↓</div>

        <div className="pipeline-row">
          {pipelineSteps.slice(3, 6).map((step) => (
            <article className="pipeline-step" key={step.step}>
              <span className="step-label">{step.step}</span>
              <h4>{step.title}</h4>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="pipeline-arrow">↓</div>

        <div className="pipeline-row">
          {pipelineSteps.slice(6, 9).map((step) => (
            <article className="pipeline-step" key={step.step}>
              <span className="step-label">{step.step}</span>
              <h4>{step.title}</h4>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="why-block">
        <h3>Why SVM?</h3>
        <p>
          Support Vector Machine performed best on our high-dimensional TF-IDF text features because it builds a strong
          decision boundary that separates spam and ham messages effectively in sparse, high-dimensional text spaces.
        </p>
      </div>
    </div>
  )
}

function PerformancePage() {
  const metrics = [
    { label: 'Accuracy', value: 98.60, suffix: '%' },
    { label: 'Precision', value: 98.30, suffix: '%' },
    { label: 'Recall', value: 95.97, suffix: '%' },
    { label: 'F1-score', value: 97.12, suffix: '%' },
  ]

  return (
    <div className="page-section">
      <section className="section-header" aria-labelledby="performance-title">
        <h2 id="performance-title">Model performance</h2>
        <p>
          The final evaluation compares the three classifiers on the test set. SVM is highlighted as the best-performing
          model for this text classification task.
        </p>
      </section>

      <div className="metric-grid">
        {modelResults.map((item) => (
          <article className={`metric-card ${item.highlight ? 'highlighted' : ''}`} key={item.model}>
            <div className="metric-card-header">
              <h3>{item.model}</h3>
              {item.highlight && <span className="model-tag highlighted">Best Model</span>}
            </div>
            <div className="metric-list">
              <div className="metric-row"><span className="metric-name">Accuracy</span><span className="metric-value">{item.accuracy.toFixed(2)}%</span></div>
              <div className="metric-row"><span className="metric-name">Precision</span><span className="metric-value">{item.precision.toFixed(2)}%</span></div>
              <div className="metric-row"><span className="metric-name">Recall</span><span className="metric-value">{item.recall.toFixed(2)}%</span></div>
              <div className="metric-row"><span className="metric-name">F1 Score</span><span className="metric-value">{item.f1.toFixed(2)}%</span></div>
            </div>
          </article>
        ))}
      </div>

      <div className="summary-grid" style={{ marginTop: '24px' }}>
        <article className="summary-card">
          <div className="summary-card-header">
            <h3>Top performer</h3>
            <span className="model-tag highlighted">SVM</span>
          </div>
          <div className="bar-wrapper">
            {metrics.map((metric) => (
              <div className="bar-row" key={metric.label}>
                <span className="bar-label">{metric.label}</span>
                <div className="bar-track"><span className="bar-fill svm" style={{ width: `${metric.value}%` }} /></div>
                <span className="bar-value">{metric.value.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </article>

        <article className="summary-card">
          <div className="summary-card-header">
            <h3>SVM confusion matrix</h3>
            <span className="model-tag">Prediction breakdown</span>
          </div>
          <div className="confusion-box">
            <div className="confusion-cell">
              <span>True Negative</span>
              <strong>1289</strong>
            </div>
            <div className="confusion-cell">
              <span>False Positive</span>
              <strong>7</strong>
            </div>
            <div className="confusion-cell">
              <span>False Negative</span>
              <strong>17</strong>
            </div>
            <div className="confusion-cell">
              <span>True Positive</span>
              <strong>405</strong>
            </div>
          </div>
        </article>
      </div>

      <div className="definition-list" style={{ marginTop: '24px' }}>
        <div className="definition-item">
          <strong>Accuracy</strong>
          <p>
            Accuracy measures how often the model correctly predicts the class overall across all messages in the test set.
          </p>
        </div>
        <div className="definition-item">
          <strong>Precision</strong>
          <p>
            Precision shows how many predicted spam messages were actually spam, which helps gauge false alarms.
          </p>
        </div>
        <div className="definition-item">
          <strong>Recall</strong>
          <p>
            Recall checks how many genuine spam messages were successfully identified, reflecting how well the model catches threats.
          </p>
        </div>
        <div className="definition-item">
          <strong>F1-score</strong>
          <p>
            F1-score balances precision and recall, making it especially useful when the model needs both reliability and sensitivity.
          </p>
        </div>
      </div>
    </div>
  )
}

function AboutPage() {
  return (
    <div className="page-section">
      <section className="section-header" aria-labelledby="about-title">
        <h2 id="about-title">About the project</h2>
        <p>
          This project was designed as a practical academic ML application for spam detection and risk analysis in mobile text messaging.
        </p>
      </section>

      <div className="info-grid">
        <article className="info-card">
          <h3>Project objective</h3>
          <p>
            The objective is to build a reliable text-classification system that can identify spam messages and flag threat severity
            using ML-driven reasoning. The system aims to provide actionable insight while remaining transparent and explainable.
          </p>
        </article>

        <article className="info-card">
          <h3>Problem statement</h3>
          <p>
            Traditional filtering tools often struggle with evolving spam language, fraudulent urgency, and misleading links. This project
            addresses that challenge by combining multiple models and severity themes to improve detection quality.
          </p>
        </article>

        <article className="info-card">
          <h3>Dataset information</h3>
          <p>
            The project uses publicly available real-world SMS datasets. The datasets were cleaned and combined, with a small number
            of manually created examples added for targeted data augmentation.
          </p>
        </article>

        <article className="info-card">
          <h3>Dataset source</h3>
          <p>
            The project is built from publicly available SMS spam/ham resources and adapted for academic experimentation and model training.
          </p>
        </article>
      </div>

      <div className="info-grid" style={{ marginTop: '18px' }}>
        <article className="info-card">
          <h3>Technologies used</h3>
          <div className="table-list">
            <div className="table-item"><span>Frontend</span><strong>React, Vite, CSS</strong></div>
            <div className="table-item"><span>Backend</span><strong>Python, Flask</strong></div>
            <div className="table-item"><span>Machine Learning</span><strong>Scikit-learn, TF-IDF, Logistic Regression, Multinomial Naive Bayes, SVM</strong></div>
          </div>
        </article>

        <article className="info-card">
          <h3>Feature extraction</h3>
          <p>
            The system uses combined word and character TF-IDF representations to capture both vocabulary-based and character-level patterns,
            which is particularly useful for short and noisy SMS content.
          </p>
        </article>

        <article className="info-card">
          <h3>Explainability</h3>
          <p>
            Results include prediction confidence and explanation-based reasons to make decisions more understandable to students, end users,
            and evaluators in a classroom setting.
          </p>
        </article>

        <article className="info-card">
          <h3>Threat severity</h3>
          <p>
            Threat severity uses a rule-based analysis that emphasizes urgency cues, financial language, verification requests, and scam indicators to classify Low, Medium, or High risk.
          </p>
        </article>
      </div>

      <div className="info-grid" style={{ marginTop: '18px' }}>
        <article className="info-card">
          <h3>Limitations</h3>
          <p>
            The system is designed for educational and research purposes and may not generalize perfectly to unseen scam patterns or multilingual content.
          </p>
        </article>

        <article className="info-card">
          <h3>Future scope</h3>
          <p>
            Future work can include multilingual support, browser-based detection, more advanced explainability, and a larger production-grade threat dataset.
          </p>
        </article>
      </div>
    </div>
  )
}

function App() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <main className={`page-shell ${darkMode ? 'theme-dark' : ''}`}>
      <div className="app-container app-shell">
        <header className="topbar">
          <Link className="brand" to="/" aria-label="MessageGuard home">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3 20 6v5.5c0 4.8-3.3 8-8 9.5-4.7-1.5-8-4.7-8-9.5V6l8-3Z" />
                <path d="m8.5 12 2.2 2.2 4.8-5" />
              </svg>
            </span>
            <span className="brand-copy">MessageGuard</span>
          </Link>

          <nav className="navbar" aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/analyze" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Analyze
            </NavLink>
            <NavLink to="/how-it-works" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              How It Works
            </NavLink>
            <NavLink to="/performance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Model Performance
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              About
            </NavLink>
          </nav>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setDarkMode((current) => !current)}
            aria-label="Toggle theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        <div className="page-body">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </div>

        <footer className="page-footer">
          <div>
            <strong>MessageGuard</strong>
            <div>ML-Based Spam Message Detection &amp; Threat Severity Analysis</div>
          </div>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/analyze">Analyze</Link>
            <Link to="/how-it-works">How It Works</Link>
            <Link to="/performance">Model Performance</Link>
            <Link to="/about">About</Link>
          </div>
          <div>College project / academic project</div>
        </footer>
      </div>
    </main>
  )
}

export default App

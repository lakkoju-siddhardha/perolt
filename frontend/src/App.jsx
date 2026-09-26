import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Documents from './pages/Documents.jsx';
import AskPerolt from './pages/AskPerolt.jsx';
import Settings from './pages/Settings.jsx';
import { DocumentsProvider } from './context/DocumentsContext.jsx';
import './App.css';

export default function App() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <DocumentsProvider>
      <div className="app-shell">
        <Sidebar mobileOpen={navOpen} onNavigate={() => setNavOpen(false)} />
        {navOpen && <div className="app-shell__scrim" onClick={() => setNavOpen(false)} />}

        <div className="app-shell__main">
          <header className="app-topbar">
            <button
              type="button"
              className="app-topbar__menu"
              aria-label="Toggle navigation"
              onClick={() => setNavOpen((v) => !v)}
            >
              <IconMenu />
            </button>
            <span className="app-topbar__wordmark">PEROLT</span>
          </header>

          <main className="app-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/ask" element={<AskPerolt />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </DocumentsProvider>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

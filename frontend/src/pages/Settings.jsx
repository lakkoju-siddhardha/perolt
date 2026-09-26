import './Settings.css';

export default function Settings() {
  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <h1 className="settings-page__title">Settings</h1>
        <p className="settings-page__subtitle">Workspace and connection details.</p>
      </header>

      <section className="settings-page__card card">
        <h2 className="settings-page__card-title">Account</h2>
        <div className="settings-page__row">
          <span>Name</span>
          <span className="settings-page__value">Siddhu</span>
        </div>
        <div className="settings-page__row">
          <span>Role</span>
          <span className="settings-page__value">Workspace owner</span>
        </div>
      </section>

      <section className="settings-page__card card">
        <h2 className="settings-page__card-title">Backend connection</h2>
        <div className="settings-page__row">
          <span>API base URL</span>
          <span className="settings-page__value settings-page__mono">http://localhost:5000/api</span>
        </div>
        <div className="settings-page__row">
          <span>Upload endpoint</span>
          <span className="settings-page__value settings-page__mono">POST /documents/upload</span>
        </div>
        <div className="settings-page__row">
          <span>Ask endpoint</span>
          <span className="settings-page__value settings-page__mono">POST /documents/ask</span>
        </div>
      </section>
    </div>
  );
}

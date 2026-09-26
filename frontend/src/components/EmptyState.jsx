import './EmptyState.css';

export default function EmptyState({ title, hint, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <IconBook />
      </span>
      <h3 className="empty-state__title">{title}</h3>
      {hint && <p className="empty-state__hint">{hint}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

function IconBook() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M4 5.2c2.3-.9 4.9-.9 7 .6v13c-2.1-1.5-4.7-1.5-7-.6V5.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 5.2c-2.3-.9-4.9-.9-7 .6v13c2.1-1.5 4.7-1.5 7-.6V5.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

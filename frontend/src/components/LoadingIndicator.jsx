import './LoadingIndicator.css';

/**
 * A small set of reusable loading treatments.
 * variant: "dots" (thinking), "spinner", or "bar" (determinate progress)
 */
export default function LoadingIndicator({ variant = 'dots', label, percent }) {
  if (variant === 'bar') {
    return (
      <div className="loading-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="loading-bar__track">
          <div className="loading-bar__fill" style={{ width: `${percent ?? 0}%` }} />
        </div>
        {label && <span className="loading-bar__label">{label}</span>}
      </div>
    );
  }

  if (variant === 'spinner') {
    return (
      <span className="loading-spinner" role="status" aria-label={label || 'Loading'}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.4" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        {label && <span>{label}</span>}
      </span>
    );
  }

  return (
    <span className="loading-dots" role="status" aria-label={label || 'Perolt is thinking'}>
      <i /><i /><i />
      {label && <span className="loading-dots__label">{label}</span>}
    </span>
  );
}

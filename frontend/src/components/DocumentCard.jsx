import './DocumentCard.css';

const STATUS_LABEL = {
  ready: 'Ready',
  processing: 'Processing',
  error: 'Failed'
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function DocumentCard({ document }) {
  const {
    filename = 'Untitled document',
    pages,
    uploadedAt,
    status = 'ready',
    chunks
  } = document || {};

  const tagClass = status === 'ready' ? 'tag--ready' : status === 'processing' ? 'tag--processing' : 'tag--error';

  return (
    <article className="doc-card card">
      <div className="doc-card__icon">
        <IconPdf />
      </div>
      <div className="doc-card__body">
        <h3 className="doc-card__name" title={filename}>{filename}</h3>
        <div className="doc-card__meta">
          <span>{pages != null ? `${pages} page${pages === 1 ? '' : 's'}` : 'Pages unknown'}</span>
          <span className="doc-card__dot" aria-hidden="true">·</span>
          <span>{formatDate(uploadedAt)}</span>
          <span className="doc-card__dot" aria-hidden="true">·</span>
          <span>{chunks != null ? `${chunks} chunks` : 'Chunks pending'}</span>
        </div>
      </div>
      <span className={`tag ${tagClass}`}>
        <span className="tag-dot" />
        {STATUS_LABEL[status] || status}
      </span>
    </article>
  );
}

function IconPdf() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 2.75h8.2L19 7.5v13.75H6V2.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14.2 2.75V7.5H19" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

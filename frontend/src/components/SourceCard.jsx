import './SourceCard.css';

export default function SourceCard({ index, source }) {

  const {
    chunkId,
    documentId,
    filename,
    similarity,
    content,
    text,
    preview
  } = source || {};

  const snippet = content || text || preview || '';

  const matchPercent =
    typeof similarity === 'number'
      ? Math.round(similarity * 100)
      : null;

  const shortFilename =
    filename || `Document ${documentId ?? '—'}`;

  return (
    <article className="source-card card">

      <div className="source-card__head">

        <span className="source-card__index">
          {String(index).padStart(2, '0')}
        </span>

        <div className="source-card__ids">

          <span
            className="source-card__filename"
            title={filename}
          >
            {shortFilename}
          </span>

          <span className="source-card__chunk">
            Chunk #{chunkId ?? '—'}
          </span>

        </div>

      </div>

      {matchPercent != null && (
        <div
          className="source-card__match"
          title={`Semantic search relevance score: ${similarity}`}
        >
          <span className="source-card__match-label">
            Relevance
          </span>

          <span className="source-card__match-bar">
            <span
              style={{
                width: `${Math.min(matchPercent, 100)}%`
              }}
            />
          </span>

          <span className="source-card__match-value">
            {matchPercent}%
          </span>
        </div>
      )}

      {snippet && (
        <p className="source-card__snippet">
          "{snippet}"
        </p>
      )}

    </article>
  );
}
import { Link } from 'react-router-dom';
import UploadZone from '../components/UploadZone.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useDocuments } from '../context/DocumentsContext.jsx';
import './Dashboard.css';

function normalizeUpload(result, file) {
  const doc = result?.document || result || {};
  return {
    id: doc.id ?? doc.documentId ?? `${file.name}-${Date.now()}`,
    filename: doc.filename ?? doc.name ?? file.name,
    pages: doc.pages ?? doc.pageCount ?? null,
    uploadedAt: doc.uploadedAt ?? doc.createdAt ?? new Date().toISOString(),
    status: doc.status ?? 'ready',
    chunks: doc.chunks ?? doc.chunkCount ?? null
  };
}

export default function Dashboard() {
  const { documents, addDocument } = useDocuments();

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Your Knowledge, Connected.</h1>
        <p className="dashboard__subtitle">
          Upload your documents and ask questions. Perolt finds the relevant information and explains it.
        </p>
      </header>

      <section aria-label="Upload a document">
        <UploadZone onUploaded={(result, file) => addDocument(normalizeUpload(result, file))} />
      </section>

      <section className="dashboard__recent">
        <div className="dashboard__section-head">
          <h2 className="dashboard__section-title">Recent documents</h2>
          {documents.length > 0 && (
            <Link to="/documents" className="dashboard__section-link">View all</Link>
          )}
        </div>

        {documents.length === 0 ? (
          <EmptyState
            title="Your knowledge base is empty"
            hint="Upload a PDF to start asking questions."
          />
        ) : (
          <div className="dashboard__doc-list">
            {documents.slice(0, 4).map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>

      {documents.length > 0 && (
        <section className="dashboard__cta card">
          <div>
            <h3 className="dashboard__cta-title">Ready when you are</h3>
            <p className="dashboard__cta-hint">Ask Perolt a question and it'll search across everything you've uploaded.</p>
          </div>
          <Link to="/ask" className="btn btn--primary">Ask Perolt</Link>
        </section>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import DocumentCard from '../components/DocumentCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingIndicator from '../components/LoadingIndicator.jsx';
import { useDocuments } from '../context/DocumentsContext.jsx';
import './Documents.css';

export default function Documents() {
  const { documents, loading, loadError } = useDocuments();

  return (
    <div className="documents-page">
      <header className="documents-page__header">
        <div>
          <h1 className="documents-page__title">Documents</h1>
          <p className="documents-page__subtitle">Everything Perolt has read and indexed for you.</p>
        </div>
        <Link to="/" className="btn btn--primary">Upload document</Link>
      </header>

      {loading ? (
        <div className="documents-page__loading">
          <LoadingIndicator variant="spinner" label="Loading your documents…" />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          title="Your knowledge base is empty"
          hint="Upload a PDF to start asking questions."
          action={<Link to="/" className="btn btn--primary">Upload a PDF</Link>}
        />
      ) : (
        <div className="documents-page__list">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}

      {loadError && documents.length > 0 && (
        <p className="documents-page__note">Showing documents from this session — {loadError}</p>
      )}
    </div>
  );
}

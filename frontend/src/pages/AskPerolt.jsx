import { Link } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow.jsx';
import { useDocuments } from '../context/DocumentsContext.jsx';
import './AskPerolt.css';

export default function AskPerolt() {
  const { documents, loading } = useDocuments();
  const noDocuments = !loading && documents.length === 0;

  return (
    <div className="ask-page">
      <header className="ask-page__header">
        <h1 className="ask-page__title">Ask Perolt</h1>
        <p className="ask-page__subtitle">Ask anything about your uploaded documents.</p>
      </header>

      {noDocuments && (
        <div className="ask-page__notice">
          No documents yet — <Link to="/">upload a PDF</Link> before asking a question.
        </div>
      )}

      <div className="ask-page__window">
        <ChatWindow />
      </div>
    </div>
  );
}

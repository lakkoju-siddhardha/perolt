import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getDocuments } from '../services/api.js';

const DocumentsContext = createContext(null);

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const list = await getDocuments();
      setDocuments(list);
    } catch (err) {
      // The list endpoint is best-effort (see services/api.js) — documents
      // uploaded this session still show up via addDocument below.
      setLoadError(err.message || 'Could not load documents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDocument = useCallback((doc) => {
    setDocuments((prev) => [doc, ...prev]);
  }, []);

  return (
    <DocumentsContext.Provider value={{ documents, loading, loadError, refresh, addDocument }}>
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error('useDocuments must be used within a DocumentsProvider');
  return ctx;
}

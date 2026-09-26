import { useCallback, useRef, useState } from 'react';
import { uploadDocument } from '../services/api.js';
import LoadingIndicator from './LoadingIndicator.jsx';
import './UploadZone.css';

const STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

export default function UploadZone({ onUploaded }) {

  const [status, setStatus] = useState(STATUS.IDLE);
  const [fileName, setFileName] = useState('');
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState('');
  const [details, setDetails] = useState(null);
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef(null);

  const startUpload = useCallback(async (file) => {

    if (!file) return;

    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      setStatus(STATUS.ERROR);
      setError('Perolt only reads PDF files. Try a .pdf document.');
      return;
    }

    setFileName(file.name);
    setStatus(STATUS.UPLOADING);
    setPercent(0);
    setError('');
    setDetails(null);

    try {

      const result = await uploadDocument(file, (progress) => {
        setPercent(progress);

        // Once the browser finishes sending the file,
        // the backend still needs time to process it.
        if (progress >= 100) {
          setStatus(STATUS.PROCESSING);
        }
      });

      setDetails({
        pages: result.document?.pages,
        chunks: result.totalChunks
      });

      setStatus(STATUS.SUCCESS);

      onUploaded?.(result, file);

    } catch (err) {

      setStatus(STATUS.ERROR);
      setError(err.message || 'The upload failed. Try again.');

    }

  }, [onUploaded]);


  const reset = () => {

    setStatus(STATUS.IDLE);
    setFileName('');
    setPercent(0);
    setError('');
    setDetails(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }

  };


  const handleDrop = (event) => {

    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    startUpload(file);
  };


  return (

    <div
      className={
        'upload-zone' +
        (dragging ? ' upload-zone--dragging' : '') +
        (status === STATUS.SUCCESS ? ' upload-zone--success' : '') +
        (status === STATUS.ERROR ? ' upload-zone--error' : '') +
        (status === STATUS.PROCESSING ? ' upload-zone--processing' : '')
      }

      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}

      onDragLeave={() => setDragging(false)}

      onDrop={handleDrop}
    >

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="upload-zone__input"

        onChange={(e) =>
          startUpload(e.target.files?.[0])
        }

        aria-label="Upload a PDF document"
      />


      {/* IDLE */}

      {status === STATUS.IDLE && (

        <div className="upload-zone__body">

          <span className="upload-zone__icon">
            <IconPdf />
          </span>

          <h3 className="upload-zone__title">
            Upload document
          </h3>

          <p className="upload-zone__hint">
            Drag and drop a PDF here, or click to browse.
          </p>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => inputRef.current?.click()}
          >
            Choose a PDF
          </button>

        </div>

      )}


      {/* UPLOADING */}

      {status === STATUS.UPLOADING && (

        <div className="upload-zone__body">

          <span className="upload-zone__icon upload-zone__icon--active">
            <IconPdf />
          </span>

          <h3 className="upload-zone__title">
            Uploading document
          </h3>

          <p className="upload-zone__filename">
            {fileName}
          </p>

          <div className="upload-zone__progress">

            <LoadingIndicator
              variant="bar"
              percent={percent}
              label={`Uploading — ${percent}%`}
            />

          </div>

        </div>

      )}


      {/* PROCESSING */}

      {status === STATUS.PROCESSING && (

        <div className="upload-zone__body">

          <span className="upload-zone__icon upload-zone__icon--active">
            <IconPdf />
          </span>

          <h3 className="upload-zone__title">
            Processing document
          </h3>

          <p className="upload-zone__filename">
            {fileName}
          </p>

          <div className="upload-zone__processing">

            <LoadingIndicator
              variant="dots"
              label="Extracting text and generating embeddings"
            />

          </div>

          <p className="upload-zone__hint">
            This may take a little while for large PDFs.
          </p>

        </div>

      )}


      {/* SUCCESS */}

      {status === STATUS.SUCCESS && (

        <div className="upload-zone__body">

          <span className="upload-zone__icon upload-zone__icon--success">
            <IconCheck />
          </span>

          <h3 className="upload-zone__title">
            Document ready
          </h3>

          <p className="upload-zone__filename">
            {fileName}
          </p>

          {details && (

            <p className="upload-zone__hint upload-zone__hint--success">

              {details.pages ?? '—'} pages
              {' • '}
              {details.chunks ?? '—'} chunks
              {' • '}
              Fully indexed

            </p>

          )}

          <button
            type="button"
            className="btn btn--ghost"
            onClick={reset}
          >
            Upload another
          </button>

        </div>

      )}


      {/* ERROR */}

      {status === STATUS.ERROR && (

        <div className="upload-zone__body">

          <span className="upload-zone__icon upload-zone__icon--error">
            <IconWarn />
          </span>

          <h3 className="upload-zone__title">
            Upload didn't go through
          </h3>

          <p className="upload-zone__hint upload-zone__hint--error">
            {error}
          </p>

          <button
            type="button"
            className="btn btn--ghost"
            onClick={reset}
          >
            Try again
          </button>

        </div>

      )}

    </div>
  );
}


function IconPdf() {

  return (

    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
    >

      <path
        d="M6 2.75h8.2L19 7.5v13.75H6V2.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <path
        d="M14.2 2.75V7.5H19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <path
        d="M8.6 13.2h1.1c.66 0 1.05.46 1.05 1.02 0 .56-.4 1.02-1.05 1.02H8.6v-2.04Zm0 0v3.9M13 13.2v3.9M13 13.2h1.5M13 15h1.2M16.6 13.2v3.9M16.6 13.2h1.4"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

    </svg>

  );
}


function IconCheck() {

  return (

    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
    >

      <circle
        cx="12"
        cy="12"
        r="9.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M8 12.3 10.8 15 16 9.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

    </svg>

  );
}


function IconWarn() {

  return (

    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
    >

      <path
        d="M12 3.5 21 19.5H3L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <path
        d="M12 10v4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <circle
        cx="12"
        cy="16.7"
        r="0.9"
        fill="currentColor"
      />

    </svg>

  );
}
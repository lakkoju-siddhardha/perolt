// Perolt API client
//
// Talks to the existing backend. Nothing here is mocked — every
// function calls the real endpoint and returns/throws based on the
// actual response.

const API_BASE = 'http://localhost:5000/api';

async function parseJsonSafely(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Received an unexpected response from the server.');
  }
}

/**
 * Upload a PDF document.
 * POST /api/documents/upload  (multipart/form-data, field: "document")
 *
 * @param {File} file
 * @param {(percent: number) => void} [onProgress]
 * @returns {Promise<object>} the parsed backend response
 */
export function uploadDocument(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('document', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/documents/upload`);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      let data;
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch {
        reject(new Error('Received an unexpected response from the server.'));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data.message || data.error || `Upload failed (${xhr.status}).`));
      }
    };

    xhr.onerror = () => reject(new Error('Could not reach the Perolt server. Is the backend running?'));

    xhr.send(formData);
  });
}

/**
 * Ask a question against the uploaded knowledge base.
 * POST /api/documents/ask
 *
 * @param {string} question
 * @returns {Promise<{success: boolean, question: string, answer: string, sources: Array}>}
 */
export async function askQuestion(question) {
  let response;
  try {
    response = await fetch(`${API_BASE}/documents/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
  } catch {
    throw new Error('Could not reach the Perolt server. Is the backend running?');
  }

  const data = await parseJsonSafely(response);
  if (!response.ok || data.success === false) {
    throw new Error(data.message || data.error || 'Perolt could not answer that question.');
  }
  return data;
}

/**
 * List uploaded documents.
 * GET /api/documents
 *
 * Note: this route wasn't part of the two endpoints specified in the
 * brief (upload / ask). It's called on a best-effort basis so the
 * Documents view can show what's already in the knowledge base; if
 * your backend exposes a different path, update API_BASE + this call.
 *
 * @returns {Promise<Array>}
 */
export async function getDocuments() {
  const response = await fetch(`${API_BASE}/documents`);
  const data = await parseJsonSafely(response);
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Could not load documents.');
  }
  return Array.isArray(data) ? data : data.documents || [];
}

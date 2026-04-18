import React, { useState } from 'react';
import axios from 'axios';

function Upload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];
  if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
    setError('❌ File size 5MB पेक्षा जास्त आहे! कृपया छोटी file निवडा.');
    setFile(null);
    return;
  }
  setFile(selectedFile);
  setError('');
  setSuccess('');
};

  const handleDrop = (e) => {
  e.preventDefault();
  const droppedFile = e.dataTransfer.files[0];
  if (droppedFile && droppedFile.size > 5 * 1024 * 1024) {
    setError('❌ File size 5MB पेक्षा जास्त आहे! कृपया छोटी file निवडा.');
    return;
  }
  setFile(droppedFile);
  setError('');
};

  const handleUpload = async () => {
    if (!file) return setError('Please select a file!');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/upload', formData);
      setSuccess('✅ File uploaded and data extracted!');
      onUploadSuccess(res.data.documentId, res.data.extractedData, true);
    } catch (err) {
      setError('❌ Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>📤 Upload Document</h2>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: '2px dashed #667eea',
          borderRadius: '10px',
          padding: '30px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '16px',
          background: '#f8f7ff'
        }}
        onClick={() => document.getElementById('fileInput').click()}
      >
        {file ? (
          <p>📄 {file.name}</p>
        ) : (
          <p style={{ color: '#888' }}>
            Drag & drop file here or <span style={{ color: '#667eea' }}>browse</span>
            <br />
            <small>PDF, Image, CSV, DOCX supported (Max 5MB)</small>
          </p>
        )}
      </div>

      <input
        id="fileInput"
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.png,.jpg,.jpeg,.csv,.docx"
        style={{ display: 'none' }}
      />

      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        style={{
          width: '100%',
          padding: '12px',
          background: loading ? '#aaa' : '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '⏳ Processing...' : '🚀 Upload & Extract'}
      </button>
    </div>
  );
}

export default Upload;
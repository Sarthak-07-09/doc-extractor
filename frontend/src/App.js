import React, { useState } from 'react';
import Upload from './components/Upload';
import ChatBox from './components/ChatBox';
import DataTable from './components/DataTable';
import './App.css';

function App() {
  const [documentId, setDocumentId] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  const handleUploadSuccess = (docId, data) => {
    setDocumentId(docId);
    setExtractedData(data);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📄 Doc Extractor AI</h1>
        <p>Upload documents and chat with AI</p>
      </header>

      <main className="app-main">
        <div className="left-panel">
          <Upload onUploadSuccess={handleUploadSuccess} />
          {extractedData && <DataTable data={extractedData} />}
        </div>

        <div className="right-panel">
          <ChatBox documentId={documentId} />
        </div>
      </main>
    </div>
  );
}

export default App;
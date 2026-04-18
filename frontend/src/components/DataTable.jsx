import React from 'react';

function DataTable({ data }) {
  const renderValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {Object.entries(value).map(([k, v]) => (
              <tr key={k}>
                <td style={{ padding: '6px', fontWeight: '600', color: '#667eea', width: '40%' }}>{k}</td>
                <td style={{ padding: '6px' }}>{renderValue(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return String(value);
  };

  return (
    <div className="card">
      <h2>📊 Extracted Data</h2>

      {data?.documentType && (
        <div style={{
          background: '#f0edff',
          padding: '8px 14px',
          borderRadius: '20px',
          display: 'inline-block',
          marginBottom: '16px',
          color: '#667eea',
          fontWeight: '600'
        }}>
          📁 {data.documentType?.toUpperCase()}
        </div>
      )}

      {data?.summary && (
        <p style={{
          background: '#f8f9fa',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          color: '#555',
          fontSize: '0.9rem'
        }}>
          {data.summary}
        </p>
      )}

      {data?.extractedFields && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{ background: '#667eea', color: 'white' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Field</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.extractedFields).map(([key, value], i) => (
                <tr key={key} style={{ background: i % 2 === 0 ? '#f8f7ff' : 'white' }}>
                  <td style={{ padding: '10px', fontWeight: '600', color: '#555' }}>{key}</td>
                  <td style={{ padding: '10px' }}>{renderValue(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DataTable;
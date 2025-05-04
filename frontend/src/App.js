import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState('Baglanıyor...');
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    // Backend'e baglanti testi
    fetch('http://localhost:3001/api/test')
      .then(response => response.json())
      .then(data => {
        setBackendStatus('✅ Baglanti Basarili');
        setApiData(data);
      })
      .catch(error => {
        setBackendStatus('❌ Baglanti Hatasi');
        console.error('Backend baglanti hatasi:', error);
      });
  }, []);

  return (
    <div className="App">
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            
            {/* Header */}
            <div className="text-center mb-5">
              <h1 className="display-4 text-primary">🛒 KolaySatis</h1>
              <p className="lead">E-Ticaret Platformu</p>
            </div>

            {/* Status Cards */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body text-center">
                    <h5 className="card-title">Frontend Status</h5>
                    <p className="card-text">
                      <span className="badge bg-success fs-6">✅ React Calisiyor</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body text-center">
                    <h5 className="card-title">Backend Status</h5>
                    <p className="card-text">
                      <span className={`badge fs-6 ${backendStatus.includes('✅') ? 'bg-success' : 'bg-warning'}`}>
                        {backendStatus}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* API Test Result */}
            {apiData && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5>📡 API Test Sonucu</h5>
                </div>
                <div className="card-body">
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(apiData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="text-center mt-4">
              <small className="text-muted">
                Docker ile calisiyor 🐳
              </small>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
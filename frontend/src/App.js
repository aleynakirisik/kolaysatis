import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

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

  // Dashboard component'i - login sonrası gösterilecek
  const Dashboard = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
      // localStorage'dan kullanıcı bilgisini al
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }, []);

    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    };

    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-success text-white">
                <h4>🎉 Hoş Geldiniz - Dashboard</h4>
              </div>
              <div className="card-body">
                {user && (
                  <div className="mb-4">
                    <h5>Kullanıcı Bilgileri:</h5>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Rol:</strong> {user.role}</p>
                    <p><strong>ID:</strong> {user.id}</p>
                  </div>
                )}
                <p>Başarıyla giriş yaptınız! Bu sayfa geliştirme aşamasındadır.</p>
                
                <div className="d-flex gap-2">
                  <Link to="/" className="btn btn-primary">
                    🏠 Ana Sayfa
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline-danger">
                    🚪 Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Ana sayfa component'i
  const HomePage = () => (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="display-4 text-primary">🛒 KolaySatis</h1>
            <p className="lead">E-Ticaret Platformu</p>
          </div>

          {/* Navigation */}
          <div className="text-center mb-4">
            <Link to="/login" className="btn btn-primary me-3">
              🔐 Giris Yap
            </Link>
            <Link to="/register" className="btn btn-outline-primary">
              📝 Kayit Ol
            </Link>
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
  );

  return (
    <Router>
      <div className="App">
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <Link className="navbar-brand" to="/">
              🛒 KolaySatis
            </Link>
            <div className="navbar-nav ms-auto">
              <Link className="nav-link" to="/">Ana Sayfa</Link>
              <Link className="nav-link" to="/login">Giris</Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Diger sayfalar icin route'lar buraya eklenecek */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
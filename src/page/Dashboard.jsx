import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState([]);
  const [serviceSummary, setServiceSummary] = useState(null);
  const [shareReferral, setShareReferral] = useState({ link: '', code: '' });
  const [referrals, setReferrals] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    navigate('/login');
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = Cookies.get('jwt_token');
    
    try {
      const queryParams = new URLSearchParams({ search, sort }).toString();
      const response = await fetch(`https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        const payload = resData.data;
        setMetrics(payload.metrics || []);
        setServiceSummary(payload.serviceSummary || null);
        setShareReferral(payload.referral || { link: '', code: '' });
        setReferrals(payload.referrals || []);
        setCurrentPage(1);
      } else {
        setError(`${resData.message || 'Failed to fetch data'} (${response.status})`);
      }
    } catch (err) {
      setError('Network validation failure matching gateway parameters.');
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalEntries = referrals.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = referrals.slice(indexOfFirstRow, indexOfLastRow);

  const displayFrom = totalEntries === 0 ? 0 : indexOfFirstRow + 1;
  const displayTo = Math.min(indexOfLastRow, totalEntries);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.replace(/-/g, '/');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Navbar */}
      <nav aria-label="Primary" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid #ccc' }}>
        <span style={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')} aria-label="Go to dashboard home">Go Business</span>
        <div>
          <button onClick={() => navigate('/')} style={{ marginRight: '15px' }}>Home</button>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </nav>

      <header style={{ marginTop: '20px' }}>
        <h1>Referral Dashboard</h1>
        <p>Track your referrals, earnings, and partner activity in one place.</p>
      </header>

      {loading && <div>Loading data streams...</div>}
      {error && <div role="alert" style={{ color: 'red', margin: '15px 0' }}>{error}</div>}

      {!loading && !error && (
        <>
          <section aria-label="Overview metrics" style={{ margin: '30px 0', padding: '15px', background: '#f9f9f9' }}>
            <h2>Overview</h2>
            <div style={{ display: 'flex', gap: '30px' }}>
              {metrics.map((metric) => (
                <div key={metric.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
                  <div style={{ color: '#666' }}>{metric.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{metric.value}</div>
                </div>
              ))}
            </div>
          </section>

          {serviceSummary && (
            <section aria-label="Service summary" style={{ margin: '30px 0' }}>
              <h2>Service summary</h2>
              <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#eee' }}>
                    <th>Service</th>
                    <th>Your Referrals</th>
                    <th>Active Referrals</th>
                    <th>Total Ref. Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{serviceSummary?.service || '-'}</td>
                    <td>{serviceSummary?.yourReferrals || 0}</td>
                    <td>{serviceSummary?.activeReferrals || 0}</td>
                    <td>{serviceSummary?.totalRefEarnings ? formatCurrency(serviceSummary.totalRefEarnings) : '$0'}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          <section aria-label="Share referral" style={{ margin: '30px 0', padding: '15px', border: '1px solid #ccc' }}>
            <h3>Refer friends and earn more</h3>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Your Referral Link</label>
              <input type="text" readOnly value={shareReferral.link} style={{ width: '70%', padding: '5px', marginRight: '10px' }} />
              <button onClick={() => copyToClipboard(shareReferral.link)}>Copy</button>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Your Referral Code</label>
              <input type="text" readOnly value={shareReferral.code} style={{ width: '70%', padding: '5px', marginRight: '10px' }} />
              <button onClick={() => copyToClipboard(shareReferral.code)}>Copy</button>
            </div>
          </section>

          <section style={{ margin: '30px 0' }}>
            <h2>All referrals</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <input 
                type="text" 
                placeholder="Name or service..." 
                aria-label="Search referrals"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '8px', width: '300px' }}
              />
              <label>
                Sort by date:{' '}
                <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: '8px' }}>
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
              </label>
            </div>

            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f2f2f2' }}>
                  <th>Name</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>No matching entries</td>
                  </tr>
                ) : (
                  currentRows.map((row) => (
                    <tr 
                      key={row.id} 
                      onClick={() => navigate(`/referral/${row.id}`)} 
                      style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td>{row.name}</td>
                      <td>{row.serviceName}</td>
                      <td>{formatDate(row.date)}</td>
                      <td>{formatCurrency(row.profit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
              <span>Showing {displayFrom}–{displayTo} of {totalEntries} entries</span>
              <div>
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  style={{ marginRight: '5px' }}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page} 
                    onClick={() => setCurrentPage(page)}
                    style={{ margin: '0 2px', fontWeight: currentPage === page ? 'bold' : 'normal' }}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  style={{ marginLeft: '5px' }}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      <footer style={{ marginTop: '5px', paddingTop: '20px', borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
        <span>Go Business © 2024 Go Business</span>
        <nav aria-label="Footer">
          <a href="#about" style={{ marginRight: '15px' }}>About</a>
          <a href="#privacy">Privacy</a>
        </nav>
      </footer>
    </div>
  );
};

export default Dashboard;
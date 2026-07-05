import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const ReferralDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(false);
      const token = Cookies.get('jwt_token');

      try {
        const response = await fetch(`https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals?id=${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const resData = await response.json();
        
        if (response.ok && resData.success && resData.data.referrals) {
          const match = resData.data.referrals.find(item => item.id.toString() === id.toString());
          if (match) {
            setReferral(match);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    navigate('/login');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading detail views...</div>;

  if (error || !referral) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Referral not found</h2>
        <Link to="/">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <nav aria-label="Primary" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid #ccc' }}>
        <span style={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')} aria-label="Go to dashboard home">Go Business</span>
        <button onClick={handleLogout}>Log out</button>
      </nav>

      <div style={{ marginTop: '30px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#0070f3' }}>← Back to dashboard</Link>
        <h1>Referral Details</h1>
        <h2>{referral.name}</h2>
        
        <dl style={{ background: '#f9f9f9', padding: '20px', borderRadius: '4px', lineHeight: '2' }}>
          <dt><strong>Referral ID:</strong></dt>
          <dd>{referral.id}</dd>
          
          <dt><strong>Service Name:</strong></dt>
          <dd>{referral.serviceName}</dd>
          
          <dt><strong>Date:</strong></dt>
          <dd>{referral.date.replace(/-/g, '/')}</dd>
          
          <dt><strong>Profit:</strong></dt>
          <dd>{formatCurrency(referral.profit)}</dd>
        </dl>
      </div>
    </div>
  );
};

export default ReferralDetail;
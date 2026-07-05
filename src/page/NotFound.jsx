import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>
        Back to dashboard
      </Link>
    </div>
  );
};

export default NotFound;
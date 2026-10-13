import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div style={{ maxWidth: '480px', margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--slate-100)', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <FileQuestion size={32} />
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
        Page Not Found (404)
      </h1>
      <p style={{ color: 'var(--slate-600)', fontSize: '14px', marginBottom: '24px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={16} /> Back to Homepage
      </Link>
    </div>
  );
};

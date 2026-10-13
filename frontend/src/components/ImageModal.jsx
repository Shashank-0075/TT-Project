import React, { useState, useEffect } from 'react';
import { X, ZoomIn, Download } from 'lucide-react';
import { complaintApi } from '../api/complaints';

export const SecureImage = ({ path, alt = 'Uploaded photo', className = '', style = {}, onClick }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let currentBlob = null;

    if (!path) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    complaintApi.fetchImageBlobUrl(path)
      .then((url) => {
        if (!active) return;
        if (url) {
          currentBlob = url;
          setBlobUrl(url);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (currentBlob) {
        URL.revokeObjectURL(currentBlob);
      }
    };
  }, [path]);

  if (loading) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--slate-100)', color: 'var(--slate-400)', minHeight: '120px' }}>
        <span style={{ fontSize: '12px' }}>Loading image...</span>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--slate-100)', color: 'var(--slate-400)', minHeight: '120px' }}>
        <span style={{ fontSize: '12px' }}>Unable to load image</span>
      </div>
    );
  }

  return (
    <img
      src={blobUrl}
      alt={alt}
      className={className}
      style={{ ...style, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    />
  );
};

export const ImageModal = ({ isOpen, imagePath, title = 'Image Preview', onClose }) => {
  if (!isOpen || !imagePath) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 60 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', backgroundColor: 'transparent', boxShadow: 'none' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', marginBottom: '12px' }}>
          <span style={{ fontWeight: 600 }}>{title}</span>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '8px', overflow: 'hidden', textAlign: 'center' }}>
          <SecureImage
            path={imagePath}
            alt={title}
            style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
          />
        </div>
      </div>
    </div>
  );
};

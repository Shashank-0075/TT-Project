import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ page, totalPages, totalElements, size, onPageChange }) => {
  if (totalPages <= 1) return null;

  const start = page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', fontSize: '13px', color: 'var(--slate-500)' }}>
      <div>
        Showing <strong style={{ color: 'var(--slate-800)' }}>{start}</strong> to{' '}
        <strong style={{ color: 'var(--slate-800)' }}>{end}</strong> of{' '}
        <strong style={{ color: 'var(--slate-800)' }}>{totalElements}</strong> entries
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="btn btn-secondary btn-sm"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 600, color: 'var(--slate-700)' }}>
          Page {page + 1} of {totalPages}
        </div>
        <button
          className="btn btn-secondary btn-sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

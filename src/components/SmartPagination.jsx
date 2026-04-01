import React from 'react';

function SmartPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);
      if (currentPage <= 4) end = Math.min(totalPages - 1, 6);
      if (currentPage >= totalPages - 3) start = Math.max(2, totalPages - 5);
      if (start > 2) pages.push('start-ellipsis');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('end-ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="smart-pagination">
      <button className="page-btn nav" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>← Prev</button>
      <div className="page-numbers">
        {pages.map((page) => {
          if (page === 'start-ellipsis' || page === 'end-ellipsis') {
            return <span key={page} className="ellipsis">•••</span>;
          }
          return (
            <button 
              key={`page-${page}`} 
              className={`page-btn ${currentPage === page ? 'active' : ''}`} 
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          );
        })}
      </div>
      <button className="page-btn nav" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next →</button>
      <span className="page-info">{currentPage} / {totalPages}</span>
    </div>
  );
}

export default SmartPagination;

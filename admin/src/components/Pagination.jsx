import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageStart = currentPage < 6 ? 1 : currentPage;
  const pageEnd = Math.min(totalPages, pageStart + 5);
  const visiblePages = Array.from({ length: pageEnd - pageStart + 1 }, (_, index) => pageStart + index);

  return (
    <div className='flex w-full items-center justify-center gap-2 px-1 py-1'>
      <div className='flex flex-nowrap items-center justify-center gap-1'>
        {visiblePages.map((pageNumber) => (
          <button
            type='button'
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`min-w-8 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              currentPage === pageNumber
                ? 'border-black bg-black text-white'
                : 'border-gray-300 hover:bg-gray-100'
            }`}
          >
            {pageNumber}
          </button>
        ))}

        {pageEnd < totalPages && (
          <>
            <span className='px-1 py-2 text-gray-400'>...</span>
            <button
              type='button'
              onClick={() => onPageChange(totalPages)}
              className='min-w-8 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100'
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Pagination;

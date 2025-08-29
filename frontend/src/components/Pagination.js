import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange,
  showItemsPerPage = true,
  className = '' 
}) => {
  // Calculate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Items Info */}
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Items Per Page Selector */}
        {showItemsPerPage && totalItems > 12 && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={96}>96</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 transition-colors"
            title="First page"
          >
            <FiChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 transition-colors"
            title="Previous page"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-golden-600 text-white hover:bg-golden-700'
                        : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 transition-colors"
            title="Next page"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 transition-colors"
            title="Last page"
          >
            <FiChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

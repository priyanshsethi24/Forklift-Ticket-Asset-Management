import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

const itemsPerPage = 5;

const Pagination = (props) => {
  const { totalItems, setItemOffset, itemOffset, limit = itemsPerPage } = props;
  const { t } = useTranslation();
  
  const pageCount = totalItems > 0 ? Math.ceil(totalItems / limit) : 1;
  const currentPage = itemOffset + 1; // Convert 0-based to 1-based
  
  const handlePageClick = (page) => {
    setItemOffset(page - 1); // Convert 1-based to 0-based
  };
  
  // Effect to handle page adjustment when totalItems changes
  useEffect(() => {
    if (currentPage > pageCount) {
      setItemOffset(pageCount > 0 ? pageCount - 1 : 0); // Go to the last page or first page if no pages exist
    }
  }, [totalItems, currentPage, pageCount, setItemOffset]);
  
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 1; // Number of pages to show before and after the current page
    const startPage = Math.max(1, currentPage - maxVisiblePages);
    const endPage = Math.min(pageCount, currentPage + maxVisiblePages);
    
    // Add Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm  border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        {t("pagination.previous")}
      </button>
    );
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      if (i === currentPage) {
        pages.push(
          <button 
            key={i} 
            className="px-3 py-1 text-sm  bg-blue-500 text-white"
          >
            {i}
          </button>
        );
      } else {
        pages.push(
          <button 
            key={i} 
            onClick={() => handlePageClick(i)}
            className="px-3 py-1 text-sm  border border-gray-300 hover:bg-gray-100"
          >
            {i}
          </button>
        );
      }
    }
    
    // Add ellipses if there are more pages
    if (endPage < pageCount) {
      pages.push(<span key="ellipsis" className="px-2">...</span>);
      pages.push(
        <button 
          key={pageCount} 
          onClick={() => handlePageClick(pageCount)}
          className="px-3 py-1 text-sm  border border-gray-300 hover:bg-gray-100"
        >
          {pageCount}
        </button>
      );
    }
    
    // Add Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === pageCount}
        className="px-3 py-1 text-sm  border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
      >
        {t("pagination.next")}
      </button>
    );
    
    return pages;
  };
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 w-full py-4">
      {renderPageNumbers()}
      <p className="text-sm text-gray-600 mt-2 md:mt-0 whitespace-nowrap">
        {t('pagination.Page')} {currentPage} {t('pagination.of')} {pageCount}
      </p>
    </div>
  );
};

export default Pagination;
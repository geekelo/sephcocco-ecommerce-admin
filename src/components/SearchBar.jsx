import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import '../styles/SearchBar.css';

const SearchBar = ({
  onApply,
  onManualSearch, // New prop for manual search
  showDate = true,
  showActions = true,
  filterOptions = [],
  categoryOptions = [], // New prop for categories
  placeholder = "Search for anything",
  filterLabel = "Filter by",
  categoryLabel = "Category", // New prop for category label
  filterKey = 'status',
  initialValues = null,
}) => {
  // Use initial values if provided, otherwise use defaults
  const [search, setSearch] = useState(initialValues?.search || '');
  const [status, setStatus] = useState(initialValues?.status || 'All Status');
  const [category, setCategory] = useState(initialValues?.category || '');
  const [startDate, setStartDate] = useState(initialValues?.startDate || '');
  const [endDate, setEndDate] = useState(initialValues?.endDate || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const defaultFilterOptions = ['All Status', 'active', 'inactive', 'suspended'];
  const currentFilterOptions = filterOptions.length > 0 ? filterOptions : defaultFilterOptions;

  // Update state when initialValues change (when navigating back)
  useEffect(() => {
    if (initialValues) {
      setSearch(initialValues.search || '');
      setStatus(initialValues.status || 'All Status');
      setCategory(initialValues.category || '');
      setStartDate(initialValues.startDate || '');
      setEndDate(initialValues.endDate || '');
    }
  }, [initialValues]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search input change with debouncing for better UX
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    
    // If manual search handler is provided and no action buttons are shown, 
    // automatically trigger search after user stops typing
    if (onManualSearch && !showActions) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout for auto-search (debounced)
      searchTimeoutRef.current = setTimeout(() => {
        onManualSearch(value);
      }, 500); // Wait 500ms after user stops typing
    }
  };

  // Handle Enter key press for immediate search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Clear any pending timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      if (onManualSearch && !showActions) {
        // If manual search is available and no action buttons, use manual search
        onManualSearch(search);
      } else {
        // Otherwise use the full apply function
        handleApply();
      }
    }
  };

  const handleApply = () => {
    onApply({
      status: status === 'All Status' ? '' : status.toLowerCase(),
      category: category || '', // Pass selected category
      search_terms: search,
      start_date: startDate,
      end_date: endDate
    });
  };

  const clearFilters = () => {
    setStatus('All Status');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    
    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    onApply({ 
      status: '', 
      category: '',
      search_terms: '', 
      start_date: '', 
      end_date: '' 
    });
  };

  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Check if any filters are active
  const hasActiveFilters = search !== '' || status !== 'All Status' || category !== '' || startDate !== '' || endDate !== '';

  return (
    <div className="search-filter-section">
      {/* Search input */}
      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          className="searchfilter-input"
        />
      </div>

      {/* Status Filter Dropdown */}
      {filterOptions.length > 0 && (
        <div className="filter-container" ref={dropdownRef}>
          <button 
            className={`filter-button ${status !== 'All Status' ? 'has-filters' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <SlidersHorizontal size={16} />
            <span>{filterLabel}</span>
            {status !== 'All Status' && <span className="filter-count">1</span>}
            <ChevronDown size={14} className={`chevron ${isFilterOpen ? 'rotated' : ''}`} />
          </button>

          {isFilterOpen && (
            <div className="filter-dropdown">
              <div className="filter-options">
                {currentFilterOptions.map((option) => (
                  <div
                    key={option}
                    className={`filter-option ${status === option ? 'active' : ''}`}
                    onClick={() => {
                      setStatus(option);
                      setIsFilterOpen(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Filter Dropdown */}
      {categoryOptions.length > 0 && (
        <div className="filter-container" ref={categoryDropdownRef}>
          <button 
            className={`filter-button ${category !== '' ? 'has-filters' : ''}`}
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          >
            <SlidersHorizontal size={16} />
            <span>{category || categoryLabel}</span>
            {category !== '' && <span className="filter-count">1</span>}
            <ChevronDown size={14} className={`chevron ${isCategoryOpen ? 'rotated' : ''}`} />
          </button>

          {isCategoryOpen && (
            <div className="filter-dropdown">
              <div className="filter-options">
                <div
                  className={`filter-option ${category === '' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('');
                    setIsCategoryOpen(false);
                  }}
                >
                  All Categories
                </div>
                {categoryOptions.map((option) => (
                  <div
                    key={option}
                    className={`filter-option ${category === option ? 'active' : ''}`}
                    onClick={() => {
                      setCategory(option);
                      setIsCategoryOpen(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showDate && (
        <>
          <p className='date-text-search'>Start Date:</p>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-picker"
            placeholder="Start Date"
          />
          <p className='date-text-search'>End Date:</p>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-picker"
            placeholder="End Date"
          />
        </>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="filter-actions">
          <button className="apply-button" onClick={handleApply}>
            Apply
          </button>
          
          {hasActiveFilters && (
            <button className="clear-button" onClick={clearFilters}>
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
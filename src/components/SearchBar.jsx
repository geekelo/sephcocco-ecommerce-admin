import React, { useState, useRef, useEffect } from 'react';
import '../styles/SearchBar.css';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

const SearchBar = ({ 
  onSearch, 
  onFilter, 
  searchTerm, 
  filterOptions = [],
  placeholder = "Search for anything",
  filterLabel = "Filter by"
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState('All Status');
  const dropdownRef = useRef(null);

  // Default filter options if none provided
  const defaultFilterOptions = [
    'All Status',
    'active',
    'inactive',
    'suspended'
  ];

  const currentFilterOptions = filterOptions.length > 0 ? filterOptions : defaultFilterOptions;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterToggle = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterChange = (value) => {
    setSelectedFilters(value);
    setIsFilterOpen(false); // Close dropdown after selection
        
    // Call the onFilter callback with the updated filter
    if (onFilter) {
      onFilter(value === 'All Status' ? '' : value);
    }
  };

  const clearFilters = () => {
    setSelectedFilters('All Status');
    if (onFilter) {
      onFilter('');
    }
  };

  const hasActiveFilters = selectedFilters !== 'All Status';

  return (
    <div className="search-filter-section">
      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={onSearch}
          className="search-input"
        />
      </div>

      <div className="filter-container">
        <div className="filter-dropdown-wrapper" ref={dropdownRef}>
          <button
            className={`filter-button ${hasActiveFilters ? 'has-filters' : ''}`}
            onClick={handleFilterToggle}
          >
            <SlidersHorizontal size={16} />
            <span>{filterLabel}</span>
            {hasActiveFilters && <span className="filter-count">1</span>}
            <ChevronDown size={14} className={`chevron ${isFilterOpen ? 'rotated' : ''}`} />
          </button>

          {isFilterOpen && (
            <div className="filter-dropdown">
              {hasActiveFilters && (
                <div className="filter-header">
                  <button className="clear-filters" onClick={clearFilters}>
                    Clear
                  </button>
                </div>
              )}

              <div className="filter-options">
                {currentFilterOptions.map((option) => (
                  <div
                    key={option}
                    className={`filter-option ${selectedFilters === option ? 'active' : ''}`}
                    onClick={() => handleFilterChange(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
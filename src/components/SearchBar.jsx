import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import '../styles/SearchBar.css';

const SearchBar = ({ 
  onApply, // <-- new
  filterOptions = [],
  placeholder = "Search for anything",
  filterLabel = "Filter by"
}) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All Status');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef(null);

  const defaultFilterOptions = ['All Status', 'active', 'inactive', 'suspended'];
  const currentFilterOptions = filterOptions.length > 0 ? filterOptions : defaultFilterOptions;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    onApply({
     
        status: status === 'All Status' ? '' : status.toLowerCase(),
        search_terms: search,
        start_date: startDate,
        end_date: endDate
      
    
    });
  };

  const clearFilters = () => {
    setStatus('All Status');
    setStartDate('');
    setEndDate('');
    setSearch('');
    onApply({ status: '', search_terms: '', start_date: '', end_date: '' });
  };

  return (
    <div className="search-filter-section">
      {/* Search input */}
      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="searchfilter-input"
        />
      </div>

      {/* Status Filter Dropdown */}
      <div className="filter-container" ref={dropdownRef}>
        <button className="filter-button" onClick={() => setIsFilterOpen(!isFilterOpen)}>
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
                  onClick={() => setStatus(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Date Inputs */}
      <p className='date-text'>Start Date:</p>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="date-picker"
        placeholder="Start Date"
      />
      <p className='date-text'>End Date:</p>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="date-picker"
        placeholder="End Date"
      />

      {/* Apply Filters Button */}
      <button className="apply-button" onClick={handleApply}>
        Apply 
      </button>

      {/* Optional clear */}
    
    </div>
  );
};

export default SearchBar;

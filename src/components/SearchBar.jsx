import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import '../styles/SearchBar.css';

const SearchBar = ({
  onApply,
  onManualSearch,
  showDate = true,
  showActions = true,
  filterOptions = [],
  categoryOptions = [],
  sortOptions = [],
  extraFilterOptions = [],
  extraFilterLabel = 'Extra Filter', 
  extraFilterKey = 'extra_filter',
  showExtraFilter = false,
  // ✅ NEW: Second extra filter props
  extraFilter2Options = [],
  extraFilter2Label = 'Extra Filter 2',
  extraFilter2Key = 'extra_filter_2',
  showExtraFilter2 = false,
  placeholder = "Search for anything",
  filterLabel = "Filter by",
  categoryLabel = "Category",
  sortLabel = "Sort by",
  filterKey = 'status',
  initialValues = null,
}) => {
  const [search, setSearch] = useState(initialValues?.search || '');
  const [status, setStatus] = useState(initialValues?.status || 'All Status');
  const [category, setCategory] = useState(initialValues?.category || '');
  const [sortByLikes, setSortByLikes] = useState(initialValues?.sort_by_likes || '');
  const [sortByStock, setSortByStock] = useState(initialValues?.sort_by_stock || '');
  const [startDate, setStartDate] = useState(initialValues?.startDate || '');
  const [endDate, setEndDate] = useState(initialValues?.endDate || '');
  const [extraFilter, setExtraFilter] = useState(initialValues?.[extraFilterKey] || '');
  const [extraFilter2, setExtraFilter2] = useState(initialValues?.[extraFilter2Key] || ''); // ✅ NEW

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExtraFilterOpen, setIsExtraFilterOpen] = useState(false);
  const [isExtraFilter2Open, setIsExtraFilter2Open] = useState(false); // ✅ NEW

  const dropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const extraFilterDropdownRef = useRef(null);
  const extraFilter2DropdownRef = useRef(null); // ✅ NEW

  const searchTimeoutRef = useRef(null);

  const currentFilterOptions = filterOptions.length ? filterOptions : ['All Status', 'active', 'inactive', 'suspended'];
  const currentSortOptions = sortOptions.length ? sortOptions : ['Highest Likes', 'Most Recent', 'Alphabetical'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsFilterOpen(false);
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) setIsCategoryOpen(false);
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) setIsSortOpen(false);
      if (extraFilterDropdownRef.current && !extraFilterDropdownRef.current.contains(event.target)) setIsExtraFilterOpen(false);
      if (extraFilter2DropdownRef.current && !extraFilter2DropdownRef.current.contains(event.target)) setIsExtraFilter2Open(false); // ✅ NEW
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (onManualSearch && !showActions) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        onManualSearch(value);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (onManualSearch && !showActions) onManualSearch(search);
      else handleApply();
    }
  };

  const handleApply = () => {
    onApply({
      [filterKey]: status === 'All Status' ? '' : status.toLowerCase(),
      category,
      sort_by_likes: sortByLikes,
      sort_by_stock: sortByStock,
      search_terms: search,
      start_date: startDate,
      end_date: endDate,
      [extraFilterKey]: extraFilter || '',
      [extraFilter2Key]: extraFilter2 || '', // ✅ NEW
    });
  };

  const handleSortSelect = (option) => {
    setSortByLikes('');
    setSortByStock('');
    if (option === 'Highest Likes') setSortByLikes(option);
    else if (option === 'Highest Stocks') setSortByStock(option);
    setIsSortOpen(false);
  };

  const clearFilters = () => {
    setStatus('All Status');
    setCategory('');
    setSortByLikes('');
    setSortByStock('');
    setExtraFilter('');
    setExtraFilter2(''); // ✅ NEW
    setStartDate('');
    setEndDate('');
    setSearch('');

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    onApply({
      [filterKey]: '',
      category: '',
      sort_by_likes: '',
      sort_by_stock: '',
      [extraFilterKey]: '',
      [extraFilter2Key]: '', // ✅ NEW
      search_terms: '',
      start_date: '',
      end_date: '',
    });
  };

  const hasActiveFilters =
    search !== '' ||
    status !== 'All Status' ||
    category !== '' ||
    sortByLikes !== '' ||
    sortByStock !== '' ||
    extraFilter !== '' ||
    extraFilter2 !== '' || // ✅ NEW
    startDate !== '' ||
    endDate !== '';

  return (
    <div className="search-filter-section-search">
      {/* Search Input */}
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

      {/* Status Filter */}
      {filterOptions.length > 0 && (
        <div className="filter-container" ref={dropdownRef}>
          <button className={`filter-button ${status !== 'All Status' ? 'has-filters' : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
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

      {/* Extra Filter 1 Dropdown */}
      {showExtraFilter && extraFilterOptions.length > 0 && (
        <div className="filter-container" ref={extraFilterDropdownRef}>
          <button className={`filter-button ${extraFilter ? 'has-filters' : ''}`} onClick={() => setIsExtraFilterOpen(!isExtraFilterOpen)}>
            <SlidersHorizontal size={16} />
            <span>{extraFilterLabel}</span>
            {extraFilter && <span className="filter-count">1</span>}
            <ChevronDown size={14} className={`chevron ${isExtraFilterOpen ? 'rotated' : ''}`} />
          </button>
          {isExtraFilterOpen && (
            <div className="filter-dropdown">
              <div className="filter-options">
                <div
                  className={`filter-option ${extraFilter === '' ? 'active' : ''}`}
                  onClick={() => {
                    setExtraFilter('');
                    setIsExtraFilterOpen(false);
                  }}
                >
                  All {extraFilterLabel.replace('Filter by ', '')}
                </div>
                {extraFilterOptions.map((option) => {
                  const label = typeof option === 'string' ? option : option.label;
                  const value = typeof option === 'string' ? option : option.value;
                  return (
                    <div
                      key={value}
                      className={`filter-option ${extraFilter === value ? 'active' : ''}`}
                      onClick={() => {
                        setExtraFilter(value);
                        setIsExtraFilterOpen(false);
                      }}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ NEW: Extra Filter 2 Dropdown */}
      {showExtraFilter2 && extraFilter2Options.length > 0 && (
        <div className="filter-container" ref={extraFilter2DropdownRef}>
          <button className={`filter-button ${extraFilter2 ? 'has-filters' : ''}`} onClick={() => setIsExtraFilter2Open(!isExtraFilter2Open)}>
            <SlidersHorizontal size={16} />
            <span>{extraFilter2Label}</span>
            {extraFilter2 && <span className="filter-count">1</span>}
            <ChevronDown size={14} className={`chevron ${isExtraFilter2Open ? 'rotated' : ''}`} />
          </button>
          {isExtraFilter2Open && (
            <div className="filter-dropdown">
              <div className="filter-options">
                <div
                  className={`filter-option ${extraFilter2 === '' ? 'active' : ''}`}
                  onClick={() => {
                    setExtraFilter2('');
                    setIsExtraFilter2Open(false);
                  }}
                >
                  All {extraFilter2Label.replace('Filter by ', '')}
                </div>
                {extraFilter2Options.map((option) => {
                  const label = typeof option === 'string' ? option : option.label;
                  const value = typeof option === 'string' ? option : option.value;
                  return (
                    <div
                      key={value}
                      className={`filter-option ${extraFilter2 === value ? 'active' : ''}`}
                      onClick={() => {
                        setExtraFilter2(value);
                        setIsExtraFilter2Open(false);
                      }}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Date Pickers */}
      {showDate && (
        <>
          <p className="date-text-search">Start Date:</p>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-picker" />
          <p className="date-text-search">End Date:</p>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-picker" />
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
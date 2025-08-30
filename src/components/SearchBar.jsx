import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import '../styles/SearchBar.css';

const SearchBar = ({
  onApply,
  onManualSearch, // New prop for manual search
  showDate = true,
  showActions = true,
  filterOptions = [],
  categoryOptions = [], // Array of {label, value, name} objects
  sortOptions = [], // New prop for sort options
  placeholder = "Search for anything",
  filterLabel = "Filter by",
  categoryLabel = "Category",
  sortLabel = "Sort by", // New prop for sort label
  filterKey = 'status',
  initialValues = null,
}) => {
  // Use initial values if provided, otherwise use defaults
  const [search, setSearch] = useState(initialValues?.search || '');
  const [status, setStatus] = useState(initialValues?.status || 'All Status');
  const [category, setCategory] = useState(initialValues?.category || ''); // Display name
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId || ''); // Internal ID
  const [sortByLikes, setSortByLikes] = useState(initialValues?.sort_by_likes || ''); // Sort by likes state
  const [sortByStock, setSortByStock] = useState(initialValues?.sort_by_stock || ''); // Sort by stock state
  const [startDate, setStartDate] = useState(initialValues?.startDate || '');
  const [endDate, setEndDate] = useState(initialValues?.endDate || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false); // New sort dropdown state
  const dropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null); // New sort dropdown ref
  const searchTimeoutRef = useRef(null);

  const defaultFilterOptions = ['All Status', 'active', 'inactive', 'suspended'];
  const currentFilterOptions =  filterOptions 
  
  const defaultSortOptions = ['Highest Likes', 'Most Recent', 'Alphabetical'];
  const currentSortOptions =  sortOptions 

  // Helper function to find category by name
  const findCategoryByName = (categoryName) => {
    if (!categoryName) return null;
    return categoryOptions.find(cat => 
      (typeof cat === 'string' ? cat : cat.name || cat.label) === categoryName
    );
  };

  // Helper function to find category by ID
  const findCategoryById = (categoryId) => {
    if (!categoryId) return null;
    return categoryOptions.find(cat => 
      (typeof cat === 'object' ? cat.value : cat) === categoryId
    );
  };

  // Get the currently active sort option
  const getActiveSortOption = () => {
    if (sortByLikes) return sortByLikes;
    if (sortByStock) return sortByStock;
    return '';
  };

  // Update state when initialValues change (when navigating back)
  useEffect(() => {
    if (initialValues) {
      setSearch(initialValues.search || '');
      setStatus(initialValues.status || 'All Status');
      setSortByLikes(initialValues.sort_by_likes || ''); // Update sort by likes state
      setSortByStock(initialValues.sort_by_stock || ''); // Update sort by stock state
      
      // Handle category - could be name or ID
      const categoryName = initialValues.category || '';
      const categoryIdValue = initialValues.categoryId || '';
      
      setCategory(categoryName);
      setCategoryId(categoryIdValue);
      
      // If we have categoryId but no category name, find the name
      if (categoryIdValue && !categoryName) {
        const foundCategory = findCategoryById(categoryIdValue);
        if (foundCategory) {
          setCategory(foundCategory.name || foundCategory.label || foundCategory);
        }
      }
      
      // If we have category name but no ID, find the ID
      if (categoryName && !categoryIdValue) {
        const foundCategory = findCategoryByName(categoryName);
        if (foundCategory && typeof foundCategory === 'object') {
          setCategoryId(foundCategory.value || '');
        }
      }
      
      setStartDate(initialValues.startDate || '');
      setEndDate(initialValues.endDate || '');
    }
  }, [initialValues, categoryOptions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
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
      category: category || '', // Pass category name for display
      categoryId: categoryId || '', // Pass category ID for backend
      sort_by_likes: sortByLikes || '', // Pass sort_by_likes
      sort_by_stock: sortByStock || '', // Pass sort_by_stock
      search_terms: search,
      start_date: startDate,
      end_date: endDate
    });
  };

  const handleCategorySelect = (selectedOption) => {
    if (selectedOption === null) {
      // Handle "All Categories" selection
      setCategory('');
      setCategoryId('');
    } else {
      setCategory(selectedOption.name || selectedOption.label || '');
      setCategoryId(selectedOption.value || '');
    }
    setIsCategoryOpen(false);
  };

  // Handle sort option selection
  const handleSortSelect = (option) => {
    // Clear both sort states first
    setSortByLikes('');
    setSortByStock('');
    
    // Set the appropriate sort state based on the option
    if (option === 'Highest Likes') {
      setSortByLikes(option);
    } else if (option === 'Highest Stocks') {
      setSortByStock(option);
    }
    // For other options like 'Most Recent', 'Alphabetical', you might want to handle them differently
    // or add additional sort states as needed
    
    setIsSortOpen(false);
  };

  const clearFilters = () => {
    setStatus('All Status');
    setCategory('');
    setCategoryId('');
    setSortByLikes(''); // Clear likes sort filter
    setSortByStock(''); // Clear stock sort filter
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
      categoryId: '',
      sort_by_likes: '', // Include likes sort in clear
      sort_by_stock: '', // Include stock sort in clear
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
  const hasActiveFilters = search !== '' || status !== 'All Status' || category !== '' || sortByLikes !== '' || sortByStock !== '' || startDate !== '' || endDate !== '';

  // Get display text for category button
  const getCategoryDisplayText = () => {
    if (category) {
      return category;
    }
    return categoryLabel;
  };

  // Get display text for sort button
  const getSortDisplayText = () => {
    const activeSortOption = getActiveSortOption();
    if (activeSortOption) {
      return activeSortOption;
    }
    return sortLabel;
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
            <span>{getCategoryDisplayText()}</span>
            {category !== '' && <span className="filter-count">1</span>}
            <ChevronDown size={14} className={`chevron ${isCategoryOpen ? 'rotated' : ''}`} />
          </button>

          {isCategoryOpen && (
            <div className="filter-dropdown">
              <div className="filter-options">
                {/* All Categories option */}
                <div
                  className={`filter-option ${category === '' ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(null)}
                >
                  All Categories
                </div>
                
                {/* Category options */}
                {categoryOptions.map((option) => {
                  // Handle both string and object formats
                  const displayName = typeof option === 'string' ? option : (option.name || option.label || option.value);
                  const optionKey = typeof option === 'string' ? option : (option.value || option.name || option.label);
                  const isActive = typeof option === 'string' ? 
                    category === option : 
                    (categoryId === option.value || category === (option.name || option.label));

                  return (
                    <div
                      key={optionKey}
                      className={`filter-option ${isActive ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(option)}
                    >
                      {displayName}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sort Filter Dropdown */}
      {currentSortOptions.length > 0 && (
        <div className="filter-container" ref={sortDropdownRef}>
          <button 
            className={`filter-button ${(sortByLikes !== '' || sortByStock !== '') ? 'has-filters' : ''}`}
            onClick={() => setIsSortOpen(!isSortOpen)}
          >
            <SlidersHorizontal size={16} />
            <span>{getSortDisplayText()}</span>
            {(sortByLikes !== '' || sortByStock !== '') && <span className="filter-count">1</span>}
            <ChevronDown size={14} className={`chevron ${isSortOpen ? 'rotated' : ''}`} />
          </button>

          {isSortOpen && (
            <div className="filter-dropdown">
              <div className="filter-options">
                {/* Default sort option */}
                <div
                  className={`filter-option ${sortByLikes === '' && sortByStock === '' ? 'active' : ''}`}
                  onClick={() => {
                    setSortByLikes('');
                    setSortByStock('');
                    setIsSortOpen(false);
                  }}
                >
                  Default
                </div>
                
                {/* Sort options */}
                {currentSortOptions.map((option) => {
                  const isActive = (option === 'Highest Likes' && sortByLikes === option) || 
                                   (option === 'Highest Stocks' && sortByStock === option) ||
                                   (option !== 'Highest Likes' && option !== 'Highest Stocks' && (sortByLikes === option || sortByStock === option));
                  
                  return (
                    <div
                      key={option}
                      className={`filter-option ${isActive ? 'active' : ''}`}
                      onClick={() => handleSortSelect(option)}
                    >
                      {option}
                    </div>
                  );
                })}
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
import React from 'react';
import '../styles/SearchBar.css';
import { Search, SlidersHorizontal } from 'lucide-react';

const SearchBar = ({ onSearch, onFilter,searchTerm }) => {
  return (
      <div className="filter-container">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for anything" 
              value={searchTerm}
              onChange={onSearch}
              className="search-input"
            />
          </div>

          <button 
            className="filter-button"
            onClick={onFilter}
          >
            <SlidersHorizontal size={16} />
            <span>Filter by</span>
          </button>
        </div>
  );
};

export default SearchBar;
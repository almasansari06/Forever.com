import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import { useLocation, useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    const query = search.trim();

    if (!query) {
      setShowSearch(false);
      return;
    }

    setShowSearch(false);

    if (!location.pathname.includes('collection')) {
      navigate('/collection');
    }
  };

  if (!showSearch) return null;

  return (
    <div className='border-t border-b bg-gray-50/95 backdrop-blur-md text-center py-3.5 shadow-sm transition-all duration-300 transform translate-y-0 opacity-100 dark:border-slate-700 dark:bg-slate-900/90'>
      <div className='inline-flex items-center justify-center border border-gray-300 bg-white px-5 py-2 mx-3 rounded-full w-3/4 sm:w-1/2 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition-all duration-200 dark:border-slate-600 dark:bg-slate-950'>
        <input
          value={search}
          onChange={handleSearchChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit();
            }
          }}
          className='flex-1 outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400 dark:text-slate-100 dark:placeholder-slate-400'
          type="text"
          placeholder='Search products, categories...'
          autoFocus
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className='text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-300 mr-2 text-lg leading-none cursor-pointer'
            aria-label='Clear search'
          >
            ×
          </button>
        )}
        <img
          onClick={handleSearchSubmit}
          className='w-4 opacity-60 hover:opacity-100 transition-opacity cursor-pointer'
          src={assets.search_icon}
          alt="Search Icon"
        />
      </div>

      <img
        onClick={() => {
          setShowSearch(false);
          setSearch('');
        }}
        className='inline w-3.5 cursor-pointer opacity-60 hover:opacity-100 ml-2 transition-transform duration-200 hover:rotate-90 active:scale-90'
        src={assets.cross_icon}
        alt="Close Icon"
      />
    </div>
  );
};

export default SearchBar;

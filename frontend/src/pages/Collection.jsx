import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [categories, setCategories] = useState(['Men', 'Women', 'Kids']);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [category, setCategory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('forever_collection_category')) || [];
    } catch {
      return [];
    }
  });
  const [subCategory, setSubCategory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('forever_collection_subCategory')) || [];
    } catch {
      return [];
    }
  });
  const [sortType, setSortType] = useState(() => localStorage.getItem('forever_collection_sort') || 'relavent');

  useEffect(() => {
    localStorage.setItem('forever_collection_category', JSON.stringify(category));
  }, [category]);

  useEffect(() => {
    localStorage.setItem('forever_collection_subCategory', JSON.stringify(subCategory));
  }, [subCategory]);

  useEffect(() => {
    localStorage.setItem('forever_collection_sort', sortType);
  }, [sortType]);

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item !== e.target.value));
    } else {
      setCategory(prev => [...prev, e.target.value]);
    }
    // Sirf mobile screens par filter auto-close hoga
    if (window.innerWidth < 768) {
      setShowFilter(false);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev => prev.filter(item => item !== e.target.value));
    } else {
      setSubCategory(prev => [...prev, e.target.value]);
    }
    // Sirf mobile screens par filter auto-close hoga
    if (window.innerWidth < 768) {
      setShowFilter(false);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice(0);

    // Search Filter
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      productsCopy = productsCopy.filter(item => {
        const name = (item.name || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        const subCategory = (item.subCategory || '').toLowerCase();

        return name.includes(term) || category.includes(term) || subCategory.includes(term);
      });
    }

    // Category Filter (Case-Insensitive)
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => 
        item.category && category.some(cat => cat.toLowerCase() === item.category.toLowerCase())
      );
    }

    // SubCategory Filter (Smart Case & Spelling Match)
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => {
        if (!item.subCategory) return false;
        
        return subCategory.some(subCat => {
          const filterVal = subCat.toLowerCase();
          const itemVal = item.subCategory.toLowerCase();

          // Auto-match both 'Jewellery' and 'Jewelry' spellings
          if (filterVal.includes('jewel') && itemVal.includes('jewel')) {
            return true;
          }

          return filterVal === itemVal;
        });
      });
    }

    // Sorting
    switch (sortType) {
      case 'low-high':
        productsCopy.sort((a, b) => a.price - b.price);
        break;
      case 'high-low':
        productsCopy.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilterProducts(productsCopy);
  };

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/product-type/list`);
        const data = await response.json();
        if (data.success) {
          setProductTypes(data.productTypes || []);
          setCategories(data.productCategories || ['Men', 'Women', 'Kids']);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchProductTypes();
  }, []);

  useEffect(() => {
    applyFilter();
    setCurrentPage(1); // Reset to first page when filters change
  }, [category, subCategory, search, products, sortType]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentPage]);

  return (
    <div className='flex flex-col md:flex-row gap-6 md:gap-10 pt-8 border-t border-gray-100 max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-300 dark:border-slate-800'>

      {/* Sidebar Filter Options */}
      <div className='w-full md:w-64 flex-shrink-0'>
        {/* Mobile Filter Header Button */}
        <div 
          onClick={() => setShowFilter(!showFilter)} 
          className='md:hidden flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer shadow-sm active:scale-[0.99] transition-all duration-300 dark:bg-slate-900 dark:border-slate-700'
        >
          <div className='flex items-center gap-2.5'>
            <span className='font-semibold text-gray-800 text-base tracking-wide dark:text-slate-100'>FILTERS</span>
            {(category.length > 0 || subCategory.length > 0) && (
              <span className='bg-black text-white text-xs px-2 py-0.5 rounded-full font-medium'>
                {category.length + subCategory.length}
              </span>
            )}
          </div>
          <img 
            className={`h-3.5 w-3.5 transition-transform duration-300 ${showFilter ? 'rotate-180' : ''}`} 
            src={assets.dropdown_icon} 
            alt="Toggle Filters" 
          />
        </div>

        {/* Filter Body - Scrollable on both Mobile & PC */}
        <div className={`space-y-5 md:block md:sticky md:top-24 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar ${showFilter ? 'block mt-4' : 'hidden'}`}>
          
          {/* Categories Filter Box */}
          <div className='bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 dark:bg-slate-900 dark:border-slate-700'>
            <div className='flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-slate-700'>
              <p className='text-xs font-bold text-gray-900 tracking-wider uppercase dark:text-slate-100'>Categories</p>
              {category.length > 0 && (
                <button onClick={() => setCategory([])} className='text-[11px] text-gray-400 hover:text-black font-medium transition-colors cursor-pointer dark:hover:text-white'>
                  Clear
                </button>
              )}
            </div>
            <div className='space-y-2.5 text-sm font-medium text-gray-600 dark:text-slate-300'>
              {categories.map((cat) => (
                <label key={cat} className='flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group dark:hover:bg-slate-800'>
                  <input 
                    className='w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black dark:accent-white' 
                    type="checkbox" 
                    value={cat} 
                    checked={category.includes(cat)}
                    onChange={toggleCategory} 
                  />
                  <span className='group-hover:text-gray-900 transition-colors dark:group-hover:text-white'>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SubCategory Filter Box */}
          <div className='bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 dark:bg-slate-900 dark:border-slate-700'>
            <div className='flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-slate-700'>
              <p className='text-xs font-bold text-gray-900 tracking-wider uppercase dark:text-slate-100'>Product Type</p>
              {subCategory.length > 0 && (
                <button onClick={() => setSubCategory([])} className='text-[11px] text-gray-400 hover:text-black font-medium transition-colors cursor-pointer dark:hover:text-white'>
                  Clear
                </button>
              )}
            </div>
            <div className='space-y-2 text-sm font-medium text-gray-600 dark:text-slate-300'>
              {productTypes.length === 0 ? (
                <p className='text-xs text-gray-400 dark:text-slate-400'>No product types available yet.</p>
              ) : (
                productTypes.map((type) => (
                  <label key={type} className='flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group dark:hover:bg-slate-800'>
                    <input 
                      className='w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black dark:accent-white' 
                      type="checkbox" 
                      value={type} 
                      checked={subCategory.includes(type)}
                      onChange={toggleSubCategory} 
                    />
                    <span className='group-hover:text-gray-900 transition-colors dark:group-hover:text-white'>{type}</span>
                  </label>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 min-w-0'>

        {/* Top Header & Sort Control */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-gray-50/60 p-4 sm:p-5 rounded-2xl border border-gray-100 transition-all duration-300 dark:bg-slate-900/80 dark:border-slate-700'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          
          <div className='flex items-center gap-2 self-end sm:self-auto'>
            <span className='hidden sm:inline text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-slate-300'>Sort:</span>
            <select 
              value={sortType}
              onChange={(e) => setSortType(e.target.value)} 
              className='bg-white border border-gray-200 hover:border-gray-400 text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl outline-none cursor-pointer transition-all shadow-xs focus:ring-2 focus:ring-black/5 dark:bg-slate-950 dark:border-slate-600 dark:text-slate-100'
            >
              <option value="relavent">Sort by: Relevant</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid / Empty State */}
        {filterProducts.length > 0 ? (
          <>
            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 fade-in-up'>
              {filterProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                <ProductItem 
                  key={item._id || index} 
                  name={item.name} 
                  id={item._id} 
                  price={item.price} 
                  image={item.image} 
                  outOfStock={Boolean(item.outOfStock)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {filterProducts.length > itemsPerPage && (
              <div className='flex justify-center items-center gap-2 mt-12 mb-8'>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-slate-600 dark:hover:bg-slate-800'
                >
                  ←
                </button>

                <div className='flex gap-1 flex-wrap justify-center'>
                  {Array.from({ length: Math.ceil(filterProducts.length / itemsPerPage) }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'border border-gray-300 hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filterProducts.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(filterProducts.length / itemsPerPage)}
                  className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-slate-600 dark:hover:bg-slate-800'
                >
                  →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-center px-4 dark:bg-slate-900/60 dark:border-slate-700'>
            <p className='text-gray-500 font-medium text-lg mb-1 dark:text-slate-300'>No products match your filters</p>
            <p className='text-gray-400 text-sm mb-4 dark:text-slate-400'>Try clearing some filters to see available products.</p>
            <button 
              onClick={() => { setCategory([]); setSubCategory([]); setSortType('relavent'); }} 
              className='px-5 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm cursor-pointer'
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Collection;

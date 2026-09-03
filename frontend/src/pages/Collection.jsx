import React, { useContext, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { translations } from '../data/translations';

const Collection = () => {
  const { products, search, showSearch, language } = useContext(ShopContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const featuredType = searchParams.get('featured');
  const t = translations[language] || translations.en;
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [categories, setCategories] = useState(['Men', 'Women', 'Kids']);
  const [currentPage, setCurrentPage] = useState(() => Math.max(1, Number(searchParams.get('page')) || 1));
  const [itemsPerPage, setItemsPerPage] = useState(() => window.innerWidth < 768 ? 20 : 30);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth < 768 ? 20 : 30);
    };

    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => {
    const closeSortMenu = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setSortMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeSortMenu);
    return () => document.removeEventListener('mousedown', closeSortMenu);
  }, []);

  const [category, setCategory] = useState(() => {
    try {
      const savedCategory = sessionStorage.getItem('forever_collection_category');
      return savedCategory ? JSON.parse(savedCategory) : [];
    } catch {
      return [];
    }
  });
  const [subCategory, setSubCategory] = useState(() => {
    try {
      const savedSubCategory = sessionStorage.getItem('forever_collection_subCategory');
      return savedSubCategory ? JSON.parse(savedSubCategory) : [];
    } catch {
      return [];
    }
  });
  const [sortType, setSortType] = useState(() => sessionStorage.getItem('forever_collection_sort') || 'relavent');

  useEffect(() => {
    sessionStorage.setItem('forever_collection_category', JSON.stringify(category));
  }, [category]);

  useEffect(() => {
    sessionStorage.setItem('forever_collection_subCategory', JSON.stringify(subCategory));
  }, [subCategory]);

  useEffect(() => {
    sessionStorage.setItem('forever_collection_sort', sortType);
  }, [sortType]);

  useEffect(() => {
    localStorage.removeItem('forever_collection_category');
    localStorage.removeItem('forever_collection_subCategory');
    localStorage.removeItem('forever_collection_sort');
  }, []);

  const normalizeFilterValue = (value) => String(value ?? '').trim().toLowerCase();

  const toggleCategory = (e) => {
    const nextValue = String(e.target.value || '').trim();
    if (category.includes(nextValue)) {
      setCategory(prev => prev.filter(item => item !== nextValue));
    } else {
      setCategory(prev => [...prev, nextValue]);
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

    if (featuredType === 'latest') {
      productsCopy = productsCopy.filter(item => item.latestCollection === true || item.latestCollection === 'true');
      productsCopy.sort((first, second) => new Date(second.date || 0) - new Date(first.date || 0));
    }

    if (featuredType === 'bestseller') {
      productsCopy = productsCopy.filter(item => item.bestseller);
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();

      productsCopy = productsCopy.filter(item => {
        const name = (item.name || '').toLowerCase();
        const categoryName = (item.category || '').toLowerCase();
        const subCategoryName = (item.subCategory || '').toLowerCase();
        const combinedText = `${name} ${categoryName} ${subCategoryName}`.toLowerCase();

        if (combinedText.includes(term)) return true;

        return (
          name.includes(term) ||
          categoryName.includes(term) ||
          subCategoryName.includes(term)
        );
      });
    }

    // Category Filter (Case-Insensitive)
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => {
        const itemCategory = normalizeFilterValue(item.category);
        return itemCategory && category.some(cat => normalizeFilterValue(cat) === itemCategory);
      });
    }

    // SubCategory Filter (Smart Case & Spelling Match)
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => {
        if (!item.subCategory) return false;

        const itemVal = normalizeFilterValue(item.subCategory);

        return subCategory.some(subCat => {
          const filterVal = normalizeFilterValue(subCat);

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

  useEffect(() => {
    fetchProductTypes();

    const handleProductDataUpdated = () => {
      fetchProductTypes();
    };

    window.addEventListener('products-updated', handleProductDataUpdated);
    window.addEventListener('storage', (event) => {
      if (event.key === 'products_updated_at') {
        handleProductDataUpdated();
      }
    });

    return () => {
      window.removeEventListener('products-updated', handleProductDataUpdated);
    };
  }, []);

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, products, sortType, featuredType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, subCategory, search, sortType, featuredType]);

  useEffect(() => {
    const pageFromUrl = Math.max(1, Number(searchParams.get('page')) || 1);
    setCurrentPage((page) => page === pageFromUrl ? page : pageFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('collection_scroll_y');
    if (!savedScroll) return;

    const restoreScroll = () => window.scrollTo({ top: Number(savedScroll), left: 0, behavior: 'auto' });
    const frameId = window.requestAnimationFrame(restoreScroll);
    const timeoutId = window.setTimeout(restoreScroll, 150);
    sessionStorage.removeItem('collection_scroll_y');

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const pageFromUrl = Number(searchParams.get('page')) || 1;
    if (pageFromUrl !== currentPage) {
      return;
    }

    const savedScroll = sessionStorage.getItem('collection_scroll_y');
    if (savedScroll && Number(savedScroll) > 0) {
      return;
    }

    if (window.scrollY > 0) {
      return;
    }
  }, [currentPage, searchParams]);

  const totalPages = Math.ceil(filterProducts.length / itemsPerPage);
  const pageStart = currentPage < 6 ? 1 : currentPage;
  const pageEnd = Math.min(totalPages, pageStart + 5);
  const visiblePages = currentPage === totalPages
    ? Array.from({ length: Math.min(6, totalPages) }, (_, index) => currentPage - index)
    : Array.from({ length: pageEnd - pageStart + 1 }, (_, index) => pageStart + index);

  // Helper function to count products by category
  const getProductCountByCategory = (cat) => {
    return products.filter(product => 
      product.category && product.category.toLowerCase() === cat.toLowerCase()
    ).length;
  };

  // Helper function to count products by product type
  const getProductCountByType = (type) => {
    return products.filter(product => 
      product.subCategory && product.subCategory.toLowerCase() === type.toLowerCase()
    ).length;
  };

  const handlePageChange = (pageNum) => {
    if (pageNum === currentPage) return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    setCurrentPage(pageNum);
    const nextParams = new URLSearchParams(searchParams);
    if (pageNum === 1) nextParams.delete('page');
    else nextParams.set('page', String(pageNum));
    setSearchParams(nextParams);
  };

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
            <span className='font-semibold text-gray-800 text-base tracking-wide dark:text-slate-100'>{t.filters}</span>
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
              <p className='text-xs font-bold text-gray-900 tracking-wider uppercase dark:text-slate-100'>{t.categories}</p>
              {category.length > 0 && (
                <button onClick={() => setCategory([])} className='text-[11px] text-gray-400 hover:text-black font-medium transition-colors cursor-pointer dark:hover:text-white'>
                  {t.clear}
                </button>
              )}
            </div>
            <div className='space-y-2.5 text-sm font-medium text-gray-600 dark:text-slate-300'>
              {categories.map((cat) => {
                const productCount = getProductCountByCategory(cat);
                return (
                  <label key={cat} className='flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group dark:hover:bg-slate-800'>
                    <input 
                      className='w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black dark:accent-white' 
                      type="checkbox" 
                      value={cat} 
                      checked={category.includes(cat)}
                      onChange={toggleCategory} 
                    />
                    <span className='group-hover:text-gray-900 transition-colors dark:group-hover:text-white'>{cat}</span>
                    {productCount === 0 && (
                      <span className='ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold dark:bg-orange-900 dark:text-orange-200'>Coming Soon</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* SubCategory Filter Box */}
          <div className='bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 dark:bg-slate-900 dark:border-slate-700'>
            <div className='flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-slate-700'>
              <p className='text-xs font-bold text-gray-900 tracking-wider uppercase dark:text-slate-100'>{t.productType}</p>
              {subCategory.length > 0 && (
                <button onClick={() => setSubCategory([])} className='text-[11px] text-gray-400 hover:text-black font-medium transition-colors cursor-pointer dark:hover:text-white'>
                  {t.clear}
                </button>
              )}
            </div>
            <div className='space-y-2 text-sm font-medium text-gray-600 dark:text-slate-300'>
              {productTypes.length === 0 ? (
                <p className='text-xs text-gray-400 dark:text-slate-400'>{t.noProductTypes}</p>
              ) : (
                productTypes.map((type) => {
                  const productCount = getProductCountByType(type);
                  return (
                    <label key={type} className='flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group dark:hover:bg-slate-800'>
                      <input 
                        className='w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black dark:accent-white' 
                        type="checkbox" 
                        value={type} 
                        checked={subCategory.includes(type)}
                        onChange={toggleSubCategory} 
                      />
                      <span className='group-hover:text-gray-900 transition-colors dark:group-hover:text-white'>{type}</span>
                      {productCount === 0 && (
                        <span className='ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold dark:bg-orange-900 dark:text-orange-200'>Coming Soon</span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 min-w-0'>

        {/* Top Header & Sort Control */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-gray-50/60 p-4 sm:p-5 rounded-2xl border border-gray-100 transition-all duration-300 dark:bg-slate-900/80 dark:border-slate-700'>
          <Title text1={t.allCollections.split(' ')[0] || 'ALL'} text2={t.allCollections.split(' ').slice(1).join(' ') || 'COLLECTIONS'} />
          
          <div className='flex w-full items-center gap-2 self-end sm:w-auto sm:self-auto'>
            <span className='hidden sm:inline text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-slate-300'>{t.sort}:</span>
            <div ref={sortMenuRef} className='relative w-full sm:w-auto'>
              <button
                type='button'
                onClick={() => setSortMenuOpen((open) => !open)}
                aria-haspopup='listbox'
                aria-expanded={sortMenuOpen}
                className='flex w-full min-w-0 items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-left text-xs font-semibold text-gray-800 shadow-sm outline-none transition-all hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 sm:min-w-[190px] sm:text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-400 dark:focus:border-slate-300'
              >
                <span>{sortType === 'low-high' ? t.lowToHigh : sortType === 'high-low' ? t.highToLow : t.relevant}</span>
                <img
                  src={assets.dropdown_icon}
                  alt=''
                  aria-hidden='true'
                  className={`h-3 w-3 opacity-70 transition-transform dark:invert ${sortMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {sortMenuOpen && (
                <div role='listbox' aria-label={t.sort} className='absolute right-0 z-30 mt-2 w-full min-w-[190px] overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-gray-900/10 dark:border-slate-700 dark:bg-slate-900'>
                  {[
                    { value: 'relavent', label: t.relevant },
                    { value: 'low-high', label: t.lowToHigh },
                    { value: 'high-low', label: t.highToLow },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type='button'
                      role='option'
                      aria-selected={sortType === option.value}
                      onClick={() => {
                        setSortType(option.value);
                        setSortMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-colors sm:text-sm ${sortType === option.value ? 'bg-gray-100 font-semibold text-gray-900 dark:bg-slate-800 dark:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}
                    >
                      <span>{option.label}</span>
                      {sortType === option.value && <span aria-hidden='true' className='text-sm'>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                  watermarked={Boolean(item.logoWatermarked)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {filterProducts.length > itemsPerPage && (
              <div className='flex w-full items-center justify-center gap-2 px-1 py-1 mt-12 mb-8'>
                <div className='flex flex-nowrap items-center justify-center gap-1'>
                  {visiblePages.map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'border border-gray-300 hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {currentPage === totalPages && !visiblePages.includes(1) ? (
                    <>
                      <span className='px-1 py-2 text-gray-400 dark:text-slate-500'>...</span>
                      <button
                        type='button'
                        onClick={() => handlePageChange(1)}
                        className='flex-shrink-0 rounded-lg border border-gray-300 px-3 py-2 font-medium transition-colors hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                      >
                        1
                      </button>
                    </>
                  ) : pageEnd < totalPages && (
                    <>
                      <span className='px-1 py-2 text-gray-400 dark:text-slate-500'>...</span>
                      <button
                        type='button'
                        onClick={() => handlePageChange(totalPages)}
                        className='flex-shrink-0 rounded-lg border border-gray-300 px-3 py-2 font-medium transition-colors hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

              </div>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-center px-4 dark:bg-slate-900/60 dark:border-slate-700'>
            <p className='text-gray-500 font-medium text-lg mb-1 dark:text-slate-300'>{t.noProductsMatch}</p>
            <p className='text-gray-400 text-sm mb-4 dark:text-slate-400'>{t.tryClearingFilters}</p>
            <button 
              onClick={() => { setCategory([]); setSubCategory([]); setSortType('relavent'); }} 
              className='px-5 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm cursor-pointer'
            >
              {t.resetFilters}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Collection;

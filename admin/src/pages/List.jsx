import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import Pagination from '../components/Pagination'
import { toast } from 'react-toastify'

const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const footwearSizes = ['6', '7', '8', '9', '10'];

const PriceEditor = ({ value, onUpdate }) => {
  const [draft, setDraft] = useState(String(value ?? 0));

  useEffect(() => {
    setDraft(String(value ?? 0));
  }, [value]);

  const commit = () => {
    const normalized = (draft === '' ? '0' : draft).replace(/[^\d.]/g, '');
    const safeValue = Number.isFinite(Number(normalized)) ? Number(normalized) : 0;
    const nextValue = String(safeValue);
    setDraft(nextValue);

    if (safeValue !== Number(value ?? 0)) {
      onUpdate(safeValue);
    }
  };

  return (
    <input
      type='text'
      inputMode='numeric'
      pattern='[0-9]*'
      value={draft}
      onFocus={(e) => {
        const input = e.currentTarget;
        input.setSelectionRange(0, input.value.length);
      }}
      onChange={(e) => setDraft(e.target.value.replace(/[^\d.]/g, ''))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'NumpadEnter') {
          e.preventDefault();
          commit();
          e.currentTarget.blur();
        }
      }}
      className='w-full max-w-[80px] border rounded px-2 py-1 text-center'
      aria-label='Price'
    />
  );
};

const SizeEditor = ({ item, onUpdate }) => {
  const selectedSizes = Array.isArray(item.sizes) ? item.sizes : [];
  const [selectedOption, setSelectedOption] = useState({ clothing: '', footwear: '' });

  if (selectedSizes.length === 0) {
    return null;
  }

  const hasClothingSizes = selectedSizes.some((size) => clothingSizes.includes(size));
  const hasFootwearSizes = selectedSizes.some((size) => footwearSizes.includes(size));
  const activeGroup = hasClothingSizes ? 'clothing' : hasFootwearSizes ? 'footwear' : null;

  const addSize = (group, size) => {
    if (!size) return;
    const nextSizes = [...new Set([...selectedSizes, size])];
    onUpdate({ sizes: nextSizes });
  };

  const removeSize = (size) => {
    const nextSizes = selectedSizes.filter((existingSize) => existingSize !== size);
    onUpdate({ sizes: nextSizes });
  };

  const renderRow = (groupName, options) => {
    const rowSizes = options.filter((size) => selectedSizes.includes(size));
    const availableOptions = options.filter((size) => !selectedSizes.includes(size));

    if (activeGroup && groupName !== activeGroup) {
      return null;
    }

    if (!activeGroup && groupName === 'footwear') {
      return null;
    }

    return (
      <div className='flex items-center gap-2 flex-wrap' key={groupName}>
        {rowSizes.length > 0 ? (
          rowSizes.map((size) => (
            <button
              key={size}
              type='button'
              onClick={() => removeSize(size)}
              className='inline-flex items-center gap-1 border border-pink-200 bg-pink-50 text-pink-700 rounded px-2 py-0.5 text-[11px] font-medium'
            >
              {size}
              <span className='text-xs'>×</span>
            </button>
          ))
        ) : (
          <span className='text-[10px] text-gray-400'>—</span>
        )}

        {availableOptions.length > 0 && (
          <div className='ml-auto flex items-center gap-1'>
            <select
              value={selectedOption[groupName] || ''}
              onChange={(e) => setSelectedOption((prev) => ({ ...prev, [groupName]: e.target.value }))}
              className='border rounded px-1 py-0.5 text-[10px] min-w-[44px]'
            >
              <option value=''>Add</option>
              {availableOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <button
              type='button'
              onClick={() => {
                const chosen = selectedOption[groupName] || '';
                if (!chosen) return;
                addSize(groupName, chosen);
                setSelectedOption((prev) => ({ ...prev, [groupName]: '' }));
              }}
              className='border border-gray-300 rounded px-1.5 py-0.5 text-[10px] bg-white hover:bg-gray-100'
            >
              +
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='flex flex-col gap-1 min-w-[170px]'>
      {renderRow('clothing', clothingSizes)}
      {renderRow('footwear', footwearSizes)}
    </div>
  );
};

const List = ({token}) => {

  const [list,setList]= useState([])
  const [productTypes,setProductTypes] = useState([])
  const [categoryOptions,setCategoryOptions] = useState(['Men','Women','Kids'])
  const [selectedType,setSelectedType] = useState('All')
  const [selectedCategory,setSelectedCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products || [])
      }
      else{
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message);
    }
  }

  const fetchProductTypes = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product-type/list')
      if (response.data.success) {
        setProductTypes(response.data.productTypes || [])
        setCategoryOptions(response.data.productCategories || ['Men', 'Women', 'Kids'])
      }
    } catch (error) {
      console.log(error)
    }
  }

  const removeProduct = async (id) => {
    const shouldDelete = window.confirm('Do you want to delete this product?');
    if (!shouldDelete) return;

    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id },{headers:{token}})

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      }
      else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  const updateProduct = async (id, payload) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/update', { id, ...payload }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message || 'Product updated successfully.')
        await fetchList();
      } else {
        toast.error(response.data.message || 'Unable to update product.')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(()=>{
    fetchList()
    fetchProductTypes()
  },[])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedType])

  const filteredList = list.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || (item.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const matchesType = selectedType === 'All' || (item.subCategory || item.category || '').toLowerCase() === selectedType.toLowerCase();
    return matchesCategory && matchesType;
  })
  const totalPages = Math.ceil(filteredList.length / itemsPerPage)
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const activeFilterName = selectedCategory !== 'All' && selectedType !== 'All'
    ? `${selectedCategory} / ${selectedType}`
    : selectedCategory !== 'All'
      ? selectedCategory
      : selectedType !== 'All'
        ? selectedType
        : 'All Products'

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages || 1))
  }, [totalPages])

  const renderFilter = () => (
    <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
      <div className='flex flex-col gap-2'>
        <label className='text-sm font-medium'>Filter by Product Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className='px-3 py-2 border rounded min-w-[200px]'
        >
          <option value='All'>All Categories</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className='flex flex-col gap-2'>
        <label className='text-sm font-medium'>Filter by Product Type</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className='px-3 py-2 border rounded min-w-[200px]'
        >
          <option value='All'>All Products ({list.length})</option>
          {productTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  )

  return (
    <>
      <p className='mb-2 '>ALL Products List</p>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2'>
          <p className='text-sm text-slate-600'>
            <span className='font-semibold text-slate-800'>{activeFilterName}</span>
            <span className='mx-1'>:</span>
            <span>{filteredList.length} products found</span>
          </p>
          {selectedCategory === 'All' && selectedType === 'All' && (
            <p className='text-xs font-medium text-slate-500'>Total website products: {list.length}</p>
          )}
        </div>
        {renderFilter()}

        {/*---------------------------list table---------------------------*/}

        <div className='hidden md:grid grid-cols-[0.5fr_0.8fr_2.6fr_1fr_1.1fr_1.3fr_1fr_0.8fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>S.No</b>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Sizes</b>
          <b>Stock</b>
          <b className='text-center'>Action</b>
        </div>
        {/*--------------------Products List--------------------*/}

        {filteredList.length === 0 ? (
          <div className='border p-3 text-sm text-gray-500'>No products found for this filter.</div>
        ) : (
          paginatedList.map((item,index)=>(
            <div
              className='flex flex-col gap-3 border py-2 px-2 text-sm md:grid md:grid-cols-[0.5fr_0.8fr_2.6fr_1fr_1.1fr_1.3fr_1fr_0.8fr] md:items-center md:gap-2'
              key={item._id || index}
            >
                <p className='font-medium'>{(currentPage - 1) * itemsPerPage + index + 1}</p>
                <img className='w-12 h-12 object-cover rounded' src={item.image[0]} alt='' />
                <p
                  className='max-w-full min-w-0'
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.name}
                </p>
                <p className='break-all overflow-hidden'>{item.category}</p>
                <div className='w-full max-w-[80px]'>
                  <PriceEditor value={item.price ?? 0} onUpdate={(price) => updateProduct(item._id, { price })} />
                </div>
                <div className='w-full max-w-[170px]'>
                  {Array.isArray(item.sizes) && item.sizes.length > 0 ? (
                    <SizeEditor item={item} onUpdate={(payload) => updateProduct(item._id, payload)} />
                  ) : (
                    <span className='text-[10px] text-gray-400'>No sizes</span>
                  )}
                </div>
                <label className='flex items-center gap-2 justify-center'>
                  <input
                    type='checkbox'
                    checked={Boolean(item.outOfStock)}
                    onChange={(e) => updateProduct(item._id, { outOfStock: e.target.checked })}
                  />
                  <span className='text-xs'>{item.outOfStock ? 'Out' : 'In'}</span>
                </label>
                <p onClick={()=>removeProduct(item._id)} className='text-right md:text-center cursor-pointer text-lg'>X</p>
            </div>
          ))
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </>
  )
}

export default List

import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const footwearSizes = ['6', '7', '8', '9', '10'];

const SizeEditor = ({ item, onUpdate }) => {
  const selectedSizes = Array.isArray(item.sizes) ? item.sizes : [];
  const [selectedOption, setSelectedOption] = useState({ clothing: '', footwear: '' });

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
  const [selectedType,setSelectedType] = useState('All')

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
      }
    } catch (error) {
      console.log(error)
    }
  }

  const removeProduct = async (id) => {
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

  const filteredList = selectedType === 'All'
    ? list
    : list.filter((item) => (item.subCategory || item.category || '').toLowerCase() === selectedType.toLowerCase())

  const renderFilter = () => (
    <div className='mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between'>
      <label className='text-sm font-medium'>Filter by Product Type</label>
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className='px-3 py-2 border rounded min-w-[200px]'
      >
        <option value='All'>All Products</option>
        {productTypes.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>
  )

  return (
    <>
      <p className='mb-2 '>ALL Products List</p>
      <div className='flex flex-col gap-2'>
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
          filteredList.map((item,index)=>(
            <div className='grid grid-cols-[0.4fr_1fr_2fr_1fr] md:grid-cols-[0.5fr_0.8fr_2.6fr_1fr_1.1fr_1.3fr_1fr_0.8fr] items-center gap-2 py-2 px-2 border text-sm' key={item._id || index}>
                <p className='font-medium'>{index + 1}</p>
                <img className='w-12 ' src={item.image[0]} alt="" />
                <p
                  className='max-w-full'
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
                <input
                  type='number'
                  min='0'
                  value={item.price ?? 0}
                  onChange={(e) => updateProduct(item._id, { price: Number(e.target.value) || 0 })}
                  className='w-full max-w-[80px] border rounded px-2 py-1'
                />
                <div className='w-full max-w-[170px]'>
                  <SizeEditor item={item} onUpdate={(payload) => updateProduct(item._id, payload)} />
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

        {renderFilter()}
      </div>
    </>
  )
}

export default List

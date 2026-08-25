import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import { translations } from '../data/translations';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Cart = () => {

  const { products, formatPrice, cartItems, updateQuantity, language } = useContext(ShopContext);
  const navigate = useNavigate();
  const t = translations[language] || translations.en;

  const [cartData, setCartData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            })
          }
        }
      }
      setCartData(tempData);
      setSelectedItems((previous) => previous.filter((key) => (
        tempData.some((item) => `${item._id}:${item.size}` === key)
      )));
    }
  }, [cartItems, products]);

  const toggleItemSelection = (item) => {
    const itemKey = `${item._id}:${item.size}`;
    setSelectedItems((previous) => previous.includes(itemKey)
      ? previous.filter((key) => key !== itemKey)
      : [...previous, itemKey]);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one product to buy.');
      return;
    }
    navigate('/place-order', { state: { selectedItems } });
  };

  const allItemsSelected = cartData.length > 0 && selectedItems.length === cartData.length;

  const toggleSelectAll = () => {
    setSelectedItems(allItemsSelected
      ? []
      : cartData.map((item) => `${item._id}:${item.size}`));
  };

  const selectedAmount = cartData.reduce((total, item) => {
    if (!selectedItems.includes(`${item._id}:${item.size}`)) return total;
    const product = products.find((productItem) => productItem._id === item._id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  return (
    <div className='border-t pt-14 '>

      <div className='text-2xl mb-3'>
        <Title text1={t.yourCart.split(' ')[0] || 'YOUR'} text2={t.yourCart.split(' ').slice(1).join(' ') || 'CART'} />
      </div>

      <div>
        {cartData.length > 0 && (
          <label className='mb-3 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700'>
            <input
              type='checkbox'
              checked={allItemsSelected}
              onChange={toggleSelectAll}
              className='h-4 w-4 cursor-pointer'
            />
            Select all
          </label>
        )}
        {
          cartData.map((item, index) => {
            const productData = products.find((product) => product._id === item._id);

            // 🎯 CRITICAL FIX: Agar productData abhi tak load nahi hua, toh crash hone ke bajaye skip karein
            if (!productData) {
              return null;
            }

            return (
              <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[auto_4fr_0.5fr_0.5fr] sm:grid-cols-[auto_4fr_2fr_0.5fr] items-center gap-4'>
                <input
                  type='checkbox'
                  checked={selectedItems.includes(`${item._id}:${item.size}`)}
                  onChange={() => toggleItemSelection(item)}
                  className='h-4 w-4 cursor-pointer'
                  aria-label={`Select ${productData.name}`}
                />
                <div className='flex items-start gap-6'>
                  <img className='w-16 sm:w-20' src={productData.image?.[0] || ''} alt="" />
                  <div>
                    <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>

                    <div className='flex items-center gap-5 mt-2'>
                      <p>{formatPrice(productData.price)}</p>
                      <p className='text-sm sm:text-base text-gray-700 dark:text-gray-200'>{t.size}: {item.size}</p>
                    </div>
                  </div>
                </div>
                <input 
                  onChange={(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, item.size, Number(e.target.value))} 
                  className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' 
                  type="number" 
                  min={1} 
                  defaultValue={item.quantity} 
                />
                <img 
                  onClick={() => updateQuantity(item._id, item.size, 0)} 
                  className='w-4 mr-4 sm:w-5 cursor-pointer' 
                  src={assets.bin_icon} 
                  alt="" 
                />
              </div>
            )
          })
        }
      </div>

      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal selectedAmount={selectedAmount} />
          <div className='w-full text-end'>
            <button type='button' onClick={handleCheckout} className='bg-black text-white text-sm my-8 px-8 py-3 cursor-pointer'>
              {t.proceedToCheckout}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Cart

import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext';
import { Link, useLocation } from 'react-router-dom'
import WatermarkedImage from './WatermarkedImage';

const ProductItem = ({id,image,name,price,outOfStock,watermarked}) => {

    const {formatPrice} = useContext(ShopContext);
    const { pathname } = useLocation();

    return (
      <Link
        className='text-gray-700 cursor-pointer block w-full max-w-[200px]'
        to={`/product/${id}`}
        title={name}
        onClick={() => {
          if (pathname === '/collection') {
            sessionStorage.setItem('collection_scroll_y', String(window.scrollY));
          }
        }}
      >
      <div className='overflow-hidden relative'>
        <WatermarkedImage watermarked={watermarked} className='w-full aspect-[5/7] object-cover hover:scale-110 transition ease-in-out' src={image[0]} alt="product" />
        {outOfStock && (
          <span className='absolute top-2 left-2 bg-red-100 text-red-700 text-[10px] font-semibold px-2 py-1 rounded'>Out of stock</span>
        )}
      </div>
      <p
        className='pt-3 pb-1 text-sm max-w-full'
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
        }}
      >
        {name}
      </p>
      <p className='text-sm font-medium'>{formatPrice(price)}</p>
    </Link>
  )
}

export default ProductItem

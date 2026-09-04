import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import FeaturedProductCarousel from './FeaturedProductCarousel';

const BestSeller = () => {

    const {products}= useContext(ShopContext);
    const [bestSeller,setBestSeller]=useState([]);

    useEffect(()=>{
        const bestProduct = products.filter((item)=>(item.bestseller));
        setBestSeller(bestProduct);
    },[products])

  return (
    <div className='my-10'>
        <div className='text-center text-3xl py-8'>
            <Title text1={'BEST'} text2={'SELLERS'}/>
            <p className='w=3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
            Best Seller Of The Month Grab It As Soon As Possible.
            </p>

        </div>
        <FeaturedProductCarousel products={bestSeller} viewMorePath='/collection' />
    </div>
  )
}

export default BestSeller

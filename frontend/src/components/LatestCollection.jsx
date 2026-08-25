import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import FeaturedProductCarousel from './FeaturedProductCarousel'

const LatestCollection = () => {

    const { products } = useContext(ShopContext);
    const [latestProducts,setLatestProducts]= useState([]);

    useEffect(() => {
        const updateLatestProducts = () => {
            const hasLatestFlags = products.some((item) => item.latestCollection);
            const latest = products
                .filter((item) => item.latestCollection || !hasLatestFlags)
                .sort((first, second) => new Date(second.date || 0) - new Date(first.date || 0));

            setLatestProducts(latest);
        };

        updateLatestProducts();
        const refreshTimer = window.setInterval(updateLatestProducts, 60 * 1000);
        return () => window.clearInterval(refreshTimer);
    }, [products]);
    
    return (
    <div className='my-10'>
        <div className='text-center py-8 text-3xl'>
            <Title text1= {'LATEST '} text2= {'COLLECTIONS'}/>
            <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
            Latest Collection Of The Month Grab It As Soon As Possible.
            </p>
        </div>
      {/*Rendering products*/}
            <FeaturedProductCarousel products={latestProducts} viewMorePath='/collection?featured=latest' />
    </div>
  )
}

export default LatestCollection

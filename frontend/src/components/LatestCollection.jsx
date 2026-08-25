import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem';

const LatestCollection = () => {

    const { products } = useContext(ShopContext);
    const [latestProducts,setLatestProducts]= useState([]);

    useEffect(() => {
        const updateLatestProducts = () => {
            const oneDayInMs = 24 * 60 * 60 * 1000;
            const latest = products
                .filter((item) => {
                    if (!item.latestCollection || !item.date) return false;
                    const productAge = Date.now() - new Date(item.date).getTime();
                    return productAge >= 0 && productAge <= oneDayInMs;
                })
                .sort((first, second) => new Date(second.date) - new Date(first.date));

            setLatestProducts(latest.slice(0, 10));
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
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'> 
        {
            latestProducts.map((item,index)=>(
                <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} outOfStock={Boolean(item.outOfStock)} watermarked={Boolean(item.logoWatermarked)}/>
            ))
        }
      </div>
    </div>
  )
}

export default LatestCollection

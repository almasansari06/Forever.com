import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem';

const LatestCollection = () => {

    const { products } = useContext(ShopContext);
    const [latestProducts,setLatestProducts]= useState([]);

    useEffect(()=>{
        const fourDaysInMs = 4 * 24 * 60 * 60 * 1000;
        const activeNewArrivals = products.filter((item) => {
            if (!item.newArrival) return false;
            if (!item.date) return true;
            const productAge = Date.now() - new Date(item.date).getTime();
            return productAge <= fourDaysInMs;
        });

        if (activeNewArrivals.length > 0) {
            setLatestProducts(activeNewArrivals.slice(0,10));
            return;
        }

        setLatestProducts(products.slice(0,10));
    },[products])
    
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
                <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} outOfStock={Boolean(item.outOfStock)}/>
            ))
        }
      </div>
    </div>
  )
}

export default LatestCollection

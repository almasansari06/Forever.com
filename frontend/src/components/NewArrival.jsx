import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const NewArrival = () => {
    const { products } = useContext(ShopContext);
    const [newArrivals, setNewArrivals] = useState([]);

    useEffect(() => {
        const fourDaysInMs = 4 * 24 * 60 * 60 * 1000;
        const items = products.filter((item) => {
            if (!item.newArrival) return false;
            if (!item.date) return true;
            const productAge = Date.now() - new Date(item.date).getTime();
            return productAge <= fourDaysInMs;
        });
        setNewArrivals(items.slice(0, 5));
    }, [products]);

    if (newArrivals.length === 0) {
        return null;
    }

    return (
        <div className='my-10'>
            <div className='text-center text-3xl py-8'>
                <Title text1={'NEW'} text2={'ARRIVALS'} />
                <p className='w=3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
                    Fresh arrivals just landed for your next favorite look.
                </p>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
                {newArrivals.map((item, index) => (
                    <ProductItem key={index} id={item._id} name={item.name} image={item.image} price={item.price} outOfStock={Boolean(item.outOfStock)} />
                ))}
            </div>
        </div>
    );
};

export default NewArrival;

import React, { useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
    const [method, setMethod] = useState('cod'); // Default COD
    const { backendUrl, token, cartItems, getCartAmount, delivery_fee, products, navigate, setCartItems } = useContext(ShopContext);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', street: '', city: '', state: '', zipcode: '', country: '', phone: ''
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(data => ({ ...data, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            let orderItems = [];
            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = structuredClone(products.find(product => product._id === items));
                        if (itemInfo) {
                            itemInfo.size = item;
                            itemInfo.quantity = cartItems[items][item];
                            orderItems.push(itemInfo);
                        }
                    }
                }
            }

            let orderData = {
                address: formData,
                items: orderItems,
                amount: getCartAmount() + delivery_fee
            };

            if (method === 'cod') {
                const response = await axios.post(`${backendUrl}/api/order/place`, orderData, { headers: { token } });
                if (response.data.success) {
                    setCartItems({});
                    navigate('/orders');
                } else {
                    toast.error(response.data.message);
                }
            } else if (method === 'stripe') {
                const responseStripe = await axios.post(`${backendUrl}/api/order/stripe`, orderData, { headers: { token } });
                if (responseStripe.data.success) {
                    const { session_url } = responseStripe.data;
                    window.location.replace(session_url);
                } else {
                    toast.error(responseStripe.data.message);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* Form Fields */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} placeholder='First name' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" />
                <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} placeholder='Last name' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" />
                <input required onChange={onChangeHandler} name='email' value={formData.email} placeholder='Email address' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" />
                <input required onChange={onChangeHandler} name='street' value={formData.street} placeholder='Street' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" />
                <input required onChange={onChangeHandler} name='phone' value={formData.phone} placeholder='Phone' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" />
            </div>

            {/* Payment Method Selection */}
            <div className='mt-8'>
                <div className='flex gap-3 flex-col lg:flex-row'>
                    <div onClick={() => setMethod('stripe')} className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${method === 'stripe' ? 'border-green-400' : ''}`}>
                        <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                        <p className='text-gray-500 text-sm font-medium mx-4'>STRIPE</p>
                    </div>
                    <div onClick={() => setMethod('cod')} className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${method === 'cod' ? 'border-green-400' : ''}`}>
                        <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                        <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                    </div>
                </div>

                <div className='w-full text-end mt-8'>
                    <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>PLACE ORDER</button>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;
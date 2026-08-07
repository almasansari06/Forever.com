import React, { useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Verify = () => {
    const { token, setCartItems, backendUrl } = useContext(ShopContext);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const success = searchParams.get('success');
    const orderId = searchParams.get('orderId');

    const verifyPayment = async () => {
        try {
            if (!token) {
                console.log('Token is missing');
                return;
            }

            if (!success || !orderId) {
                toast.error('Invalid payment verification parameters');
                navigate('/cart');
                return;
            }

            console.log('Verifying payment...');
            console.log('Success:', success);
            console.log('Order ID:', orderId);

            const response = await axios.post(
                backendUrl + '/api/order/verifyStripe',
                { success, orderId },
                { headers: { token } }
            );
            console.log('Verify Stripe Response:', response.data);

            if (response.data.success) {
                setCartItems({});
                navigate('/orders');
            } else {
                navigate('/cart');
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (token && success && orderId) {
            verifyPayment();
        }
    }, [token, success, orderId]);

    return <div></div>;
};

export default Verify;

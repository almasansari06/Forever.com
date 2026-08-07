import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {

  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([])

  const loadOrderData = async () => {
    try {
      const activeToken = token || localStorage.getItem('token');
      if (!activeToken) {
        return null;
      }

      const response = await axios.post(
        backendUrl + '/api/order/userorders', 
        {}, 
        { headers: { token: activeToken } }
      );

      if (response.data.success) {
        let allOrdersItem = []
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            allOrdersItem.push({
              ...item,
              orderId: order._id,
              status: order.status || 'Order Placed',
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date
            });
          });
        });
        setOrderData(allOrdersItem.reverse());
      }

    } catch (error) {
      console.log("Error loading orders:", error);
    }
  }

  // Cancel Order Handler
  const cancelOrderHandler = async (orderId) => {
    if (!orderId) {
      toast.error("Invalid Order ID");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      const activeToken = token || localStorage.getItem('token');
      const response = await axios.post(
        backendUrl + '/api/order/cancel',
        { orderId },
        { headers: { token: activeToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Order Cancelled Successfully");
        // State se turant filter karke hata dein taaki refresh par wapas na aaye
        setOrderData(prevData => prevData.filter(item => item.orderId !== orderId));
        loadOrderData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to cancel order");
    }
  }

  useEffect(() => {
    loadOrderData();
  }, [token, backendUrl]);

  return (
    <div className='border-t pt-16 min-h-[60vh]'>

      <div className='text-2xl'>
        <Title text1={'MY '} text2={'ORDERS'} />
      </div>

      <div>
        {
          orderData.map((item, index) => (
            <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              
              {/* Product Details */}
              <div className='flex items-start gap-6 text-sm'>
                <img className='w-16 sm:w-20 rounded object-cover' src={item.image[0]} alt={item.name} />
                <div>
                  <p className='sm:text-base font-medium text-gray-900'>{item.name}</p>
                  <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                    <p>{currency}{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size} </p>
                  </div>
                  <p className='mt-1 text-xs text-gray-500'>
                    Date: <span className='text-gray-400'>{new Date(item.date).toDateString()}</span>
                  </p>
                  <p className='mt-1 text-xs text-gray-500'>
                    Payment: <span className='text-gray-400 uppercase'>{item.paymentMethod}</span>
                  </p>
                </div>
              </div>

              {/* Status and Buttons Container */}
              <div className='md:w-1/2 flex justify-between items-center gap-2'>
                
                {/* Order Status Indicator */}
                <div className='flex items-center gap-2'>
                  <p className='min-w-2.5 h-2.5 rounded-full bg-green-500'></p>
                  <p className='text-sm md:text-base font-medium text-gray-700'>
                    {item.status}
                  </p>
                </div>

                {/* Buttons Group */}
                <div className='flex items-center gap-2'>
                  <button 
                    onClick={loadOrderData} 
                    className='border border-gray-300 px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-50 active:scale-95 transition-all cursor-pointer'
                  >
                    Track Order
                  </button>

                  {/* Red Cancel Order Button */}
                  <button
                    onClick={() => cancelOrderHandler(item.orderId)}
                    className='bg-red-600 text-white hover:bg-red-700 px-3 py-2 text-sm font-medium rounded-sm active:scale-95 transition-all cursor-pointer shadow-xs'
                  >
                    Cancel Order
                  </button>
                </div>

              </div>

            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders

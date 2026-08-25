import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';
import { translations } from '../data/translations';

const Orders = () => {

  const { backendUrl, token, formatPrice, language } = useContext(ShopContext);
  const t = translations[language] || translations.en;

  const trackingSteps = [t.orderPlaced, t.packing, t.shipped, t.outForDelivery, t.delivered];

  const getStatusIndex = (status) => {
    if (!status) return 0;
    const index = trackingSteps.indexOf(status);
    return index >= 0 ? index : 0;
  };

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
              date: order.date,
              cancelledBy: order.cancelledBy || '',
              cancelledMessage: order.cancelledMessage || '',
              cancellationRequested: !!order.cancellationRequested
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
        <Title text1={t.myOrders.split(' ')[0] || 'MY'} text2={t.myOrders.split(' ').slice(1).join(' ') || 'ORDERS'} />
      </div>

      <div>
        {orderData.length === 0 ? (
          <div className='py-12 text-center text-gray-500'>{t.noOrdersFound}</div>
        ) : (
          orderData.map((item, index) => (
            <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              
              {/* Product Details */}
              <div className='flex items-start gap-6 text-sm'>
                <img className='w-16 sm:w-20 rounded object-cover' src={item.image[0]} alt={item.name} />
                <div>
                  <div className='mb-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500'>
                    {t.orderId}: <span className='text-slate-700'>{item.orderId || 'N/A'}</span>
                  </div>
                  <p className='sm:text-base font-medium text-gray-900'>{item.name}</p>
                  <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                    <p>{formatPrice(item.price)}</p>
                    <p>{t.quantity}: {item.quantity}</p>
                    <p>{t.size}: {item.size}</p>
                  </div>
                  <p className='mt-1 text-xs text-gray-500'>
                    {t.date}: <span className='text-gray-400'>{new Date(item.date).toDateString()}</span>
                  </p>
                  <p className='mt-1 text-xs text-gray-500'>
                    {t.payment}: <span className='text-gray-400 uppercase'>{item.paymentMethod}</span>
                  </p>
                </div>
              </div>

              {/* Status and Buttons Container */}
              <div className='md:w-1/2 flex flex-col gap-3 justify-between'>
                {item.status === 'Payment Pending' && item.paymentMethod === 'Stripe' ? (
                  <div className='rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700'>
                    Payment received. Please wait while we confirm and approve it.
                  </div>
                ) : item.status === 'Delivered' ? (
                  <div className='rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700'>
                    {t.orderStatusDelivered}
                  </div>
                ) : item.status === 'Cancelled' || (item.cancellationRequested && item.cancelledBy === 'user') ? (
                  <div className='cancelled-status-box px-3 py-2 text-sm rounded-sm'>
                    {item.cancelledMessage || (item.cancelledBy === 'admin'
                      ? 'Due to some technical issue, your order has been cancelled.'
                      : 'Your order has been cancelled successfully.')}
                  </div>
                ) : (
                  <div className='relative mt-1'>
                    <div className='absolute left-0 right-0 top-3 h-[2px] bg-gray-200'></div>
                    <div
                      className='absolute left-0 top-3 h-[2px] bg-orange-400 transition-all duration-300'
                      style={{ width: `${(getStatusIndex(item.status) / (trackingSteps.length - 1)) * 100}%` }}
                    ></div>

                    <div className='relative flex justify-between gap-2'>
                      {trackingSteps.map((step, stepIndex) => {
                        const isDone = stepIndex <= getStatusIndex(item.status);
                        const isCurrent = stepIndex === getStatusIndex(item.status);

                        return (
                          <div key={step} className='flex w-1/5 min-w-0 flex-col items-center text-center'>
                            <div
                              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                isDone
                                  ? 'border-orange-400 bg-orange-400 text-white'
                                  : isCurrent
                                    ? 'border-orange-300 bg-white text-orange-500'
                                    : 'border-gray-300 bg-white text-gray-400'
                              }`}
                            >
                              <span className='h-2 w-2 rounded-full bg-current'></span>
                            </div>
                            <p className={`mt-2 text-[10px] font-medium leading-tight ${isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                              {step}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!['Delivered', 'Cancelled'].includes(item.status) && !(item.cancellationRequested && item.cancelledBy === 'user') && (
                  <div className='flex flex-wrap items-center gap-2'>
                    <button 
                      onClick={loadOrderData} 
                      className='border border-gray-300 px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-50 active:scale-95 transition-all cursor-pointer'
                    >
                      {t.refresh}
                    </button>

                    <button
                      onClick={() => cancelOrderHandler(item.orderId)}
                      className='bg-red-600 text-white hover:bg-red-700 px-3 py-2 text-sm font-medium rounded-sm active:scale-95 transition-all cursor-pointer shadow-xs'
                    >
                      {t.cancelOrder}
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Orders

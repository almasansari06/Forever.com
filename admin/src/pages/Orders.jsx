import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {

    if (!token) {
      return null;
    }
    try {

      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status', { orderId, status: event.target.value }, { headers: { token } })
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  // Admin Cancel & Remove Order Handler
  const cancelOrderHandler = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel and remove this order?")) {
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + '/api/order/admin-cancel',
        { orderId },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success(response.data.message || "Order Cancelled Successfully")
        await fetchAllOrders()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Confirm user-requested cancellation
  const confirmCancellationHandler = async (orderId) => {
    if (!window.confirm("Confirm cancellation for this order?")) return;
    try {
      const response = await axios.post(
        backendUrl + '/api/order/admin-cancel',
        { orderId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message || 'Cancellation confirmed');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  return (
    <div>
      <h3 className='text-lg font-semibold mb-3'>Order Page</h3>
      <div>
        {
          orders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 rounded-lg bg-white shadow-xs' key={index}>
              <img className='w-12' src={assets.parcel_icon} alt="" />
              <div>
                <div>
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return <p className='py-0.5' key={index}>{item.name} x {item.quantity} <span>{item.size}</span> </p>
                    }
                    else {
                      return <p className='py-0.5' key={index}>{item.name} x {item.quantity} <span>{item.size}</span> ,</p>
                    }
                  })}
                </div>

                <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
                <div>
                  <p>{order.address.street + ","}</p>
                  <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                </div>
                <p>{order.address.phone}</p>

              </div>
              <div>
                <p className='text-sm sm:text-[15px]'>Items : {order.items.length}</p>
                <p className='mt-3'>Method : {order.paymentMethod}</p>
                <p>Payment : {order.payment ? 'Done' : 'Pending'}</p>
                <p>Date : {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className='text-sm sm:text-[15px] font-bold'>{currency} {order.amount}</p>

              {/* Cancellation request banner */}
              {order.cancellationRequested && !order.cancellationConfirmed && (
                <div className='col-span-full p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-800'>
                  <p className='font-semibold'>User requested cancellation</p>
                  {order.cancellationReason && <p className='text-sm'>Reason: {order.cancellationReason}</p>}
                  <div className='mt-2'>
                    <button onClick={() => confirmCancellationHandler(order._id)} className='bg-yellow-600 text-white px-3 py-1 rounded mr-2'>Confirm Cancel</button>
                  </div>
                </div>
              )}

              {/* Status Select & Cancel Button */}
              <div className='flex flex-col gap-2'>
                <select onChange={(event) => statusHandler(event, order._id)} value={order.status} className='p-2 font-semibold border border-gray-300 rounded outline-none cursor-pointer bg-gray-50'>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>

                <button
                  onClick={() => cancelOrderHandler(order._id)}
                  className='bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded text-xs transition-all active:scale-95 cursor-pointer shadow-xs'
                >
                  Cancel Order
                </button>
              </div>

            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders

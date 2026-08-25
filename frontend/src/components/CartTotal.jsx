import React, { useContext} from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';


const CartTotal = ({ selectedAmount = null }) => {


  const {formatPrice,delivery_fee,getCartAmount} = useContext(ShopContext);
  const subtotal = selectedAmount ?? getCartAmount();

  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <Title text1={'CART '} text2={' TOTALS'} />
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm'>
        <div className='flex justify-between'>
          <p>Subtotal</p>
          <p>{formatPrice(subtotal)}</p>
        </div>
        <hr/>
        <div className='flex justify-between'>
          <p>Shipping Fee</p>
          <p>{formatPrice(delivery_fee)}</p>
        </div>
        <hr/>
        <div className='flex justify-between'>
          <b>Total</b>
          <b>{formatPrice(subtotal + delivery_fee)}</b>
        </div>
      </div>
    </div>
  )
}

export default CartTotal

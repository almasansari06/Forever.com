import React from 'react'
import Title from '../components/Title'

const DeliveryReturns = () => {
  return (
    <div className='border-t pt-8 pb-20'>
      <Title text1='DELIVERY' text2='& RETURNS' />

      <div className='mx-auto mt-10 max-w-4xl space-y-8 text-sm leading-7 text-gray-600 dark:text-slate-300'>
        <section>
          <h2 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>Delivery information</h2>
          <p>
            We carefully pack every order and aim to dispatch it as quickly as possible. Delivery times can vary by location, product availability, and courier service. Once your order is shipped, you will receive the available tracking details so you can follow its progress.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>Returns and exchanges</h2>
          <p>
            If your order is eligible for a return or exchange, please contact us within 7 days of delivery with your order details. Products should be unused, unwashed, and returned with their original tags and packaging. Items that are damaged after delivery or do not meet these conditions may not be accepted.
          </p>
        </section>

        <section className='border-l-4 border-gray-900 bg-gray-100 px-5 py-4 dark:border-white dark:bg-slate-900'>
          <h2 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>Courier charges for exchanges</h2>
          <p>
            If you request an exchange because of a change of preference, size, or other customer-side reason, the courier charges for sending the replacement or returning the product will be payable by you. If the product is defective, damaged, or incorrectly sent by us, we will review the issue and help with the applicable courier charges.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>Refunds</h2>
          <p>
            Approved refunds are processed after the returned product is received and inspected. The refund will be sent to the original payment method, subject to the processing time of your bank or payment provider. Shipping and courier charges may be non-refundable unless the issue was caused by us.
          </p>
        </section>

        <p className='border-t pt-6 text-xs text-gray-500 dark:border-slate-700 dark:text-slate-400'>
          For help with a delivery, return, or exchange, please contact our support team with your order ID and a short description of the issue.
        </p>
      </div>
    </div>
  )
}

export default DeliveryReturns

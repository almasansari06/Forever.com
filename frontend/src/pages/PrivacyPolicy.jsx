import React from 'react'
import Title from '../components/Title'

const PrivacyPolicy = () => {
  return (
    <div className='border-t pt-8 pb-20'>
      <Title text1='PRIVACY' text2='POLICY' />

      <div className='mx-auto mt-10 max-w-4xl space-y-8 text-sm leading-7 text-gray-600 dark:text-slate-300'>
        <section>
          <h2 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>Your privacy matters</h2>
          <p>
            We collect only the information needed to create your account, process orders, provide delivery updates, respond to support requests, and improve your shopping experience. We do not sell your personal information or use it for unrelated purposes.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>How we protect your data</h2>
          <p>
            Your account passwords are stored in a one-way hashed form, so they are not kept as readable passwords. Personal information is protected using appropriate access controls and security practices. Only authorized people or service providers who need the information to operate the service may access it.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>Payments and service providers</h2>
          <p>
            Payments are handled through trusted payment providers. We do not store your complete card details on our servers. We may share the minimum necessary information with delivery, payment, hosting, and communication providers so they can complete the service you requested.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-lg font-semibold text-gray-900 dark:text-white'>Your choices</h2>
          <p>
            You can contact us to ask about, update, or request deletion of your personal information, subject to records we must retain for legal, security, or order-related reasons. You can also choose not to provide optional information, although some features may then be unavailable.
          </p>
        </section>

        <p className='border-t pt-6 text-xs text-gray-500 dark:border-slate-700 dark:text-slate-400'>
          By using Forever, you acknowledge this policy. We may update it when our services or legal requirements change, and the latest version will always be shown on this page.
        </p>
      </div>
    </div>
  )
}

export default PrivacyPolicy

import React from 'react'
import { Link } from 'react-router-dom'
import ProductItem from './ProductItem'

const PRODUCTS_PER_PAGE = 15

const FeaturedProductCarousel = ({ products, viewMorePath }) => {
  const pages = []
  for (let index = 0; index < products.length; index += PRODUCTS_PER_PAGE) {
    pages.push(products.slice(index, index + PRODUCTS_PER_PAGE))
  }

  const productPage = (pageProducts, pageIndex) => (
    <div key={pageIndex} className='min-w-full snap-start grid grid-cols-2 gap-x-4 gap-y-6 px-1'>
      {pageProducts.map((item, index) => (
        <ProductItem
          key={item._id || `${pageIndex}-${index}`}
          id={item._id}
          image={item.image}
          name={item.name}
          price={item.price}
          outOfStock={Boolean(item.outOfStock)}
          watermarked={Boolean(item.logoWatermarked)}
        />
      ))}
    </div>
  )

  return (
    <>
      <div className='md:hidden flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain'>
        {pages.map(productPage)}
        {products.length > PRODUCTS_PER_PAGE && (
          <div className='min-w-full snap-start flex items-center justify-center px-1'>
            <Link
              to={viewMorePath}
              className='w-full min-h-32 flex items-center justify-center border border-gray-300 text-sm font-medium hover:bg-gray-100 transition-colors dark:border-slate-700 dark:hover:bg-slate-800'
            >
              View More
            </Link>
          </div>
        )}
      </div>

      <div className='hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4 gap-y-6'>
        {products.slice(0, PRODUCTS_PER_PAGE).map((item, index) => (
          <ProductItem
            key={item._id || index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
            outOfStock={Boolean(item.outOfStock)}
            watermarked={Boolean(item.logoWatermarked)}
          />
        ))}
        {products.length > PRODUCTS_PER_PAGE && (
          <Link
            to={viewMorePath}
            className='min-h-32 flex items-center justify-center border border-gray-300 text-sm font-medium hover:bg-gray-100 transition-colors dark:border-slate-700 dark:hover:bg-slate-800'
          >
            View More
          </Link>
        )}
      </div>
    </>
  )
}

export default FeaturedProductCarousel
import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProduct from '../components/RelatedProduct';
import WatermarkedImage from '../components/WatermarkedImage';
import { toast } from 'react-toastify';
import { translations } from '../data/translations';

const Product = () => {
  const { productId } = useParams();
  const { products, formatPrice, addToCart, backendUrl, language, token, navigate } = useContext(ShopContext);
  const t = translations[language] || translations.en;
  const [productData, setProductData] = useState(null);
  const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const footwearSizes = ['6', '7', '8', '9', '10'];
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [descriptionHasMore, setDescriptionHasMore] = useState(false);
  const [detailDescriptionExpanded, setDetailDescriptionExpanded] = useState(false);
  const [detailDescriptionHasMore, setDetailDescriptionHasMore] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [activeInfoTab, setActiveInfoTab] = useState('description');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewFiles, setReviewFiles] = useState([]);
  const [reviewViewerImages, setReviewViewerImages] = useState([]);
  const [reviewViewerIndex, setReviewViewerIndex] = useState(0);
  const dragStartXRef = useRef(null);
  const imageRef = useRef(null);
  const viewerDescriptionRef = useRef(null);
  const detailDescriptionRef = useRef(null);
  const viewerHistoryRef = useRef(false);
  const reviewViewerStartXRef = useRef(null);
  const reviewViewerMovedRef = useRef(false);

  const closeImageViewer = () => {
    if (viewerHistoryRef.current) {
      viewerHistoryRef.current = false;
      window.history.back();
    }
    setViewerOpen(false);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (!products || products.length === 0) return;

    const product = products.find(item => item._id === productId);
    if (product) {
      const productImages = (product.image || []).filter(Boolean);
      setProductData({ ...product, image: productImages });
      setImage(productImages[0] || '');
      setCurrentImageIndex(0);
      closeImageViewer();
      setDescriptionExpanded(false);
      setDetailDescriptionExpanded(false);
      setActiveInfoTab('description');
      setSize(''); // Reset selected size on product change
    } else {
      setProductData(null);
    }
  }, [productId, products]);

  useEffect(() => {
    const handleBrowserBack = () => {
      if (viewerHistoryRef.current) {
        viewerHistoryRef.current = false;
        setViewerOpen(false);
      }
    };

    window.addEventListener('popstate', handleBrowserBack);
    return () => window.removeEventListener('popstate', handleBrowserBack);
  }, []);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') closeImageViewer();
      if (event.key === 'Escape') setReviewViewerImages([]);
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  useEffect(() => {
    if (!viewerOpen) return;

    const handlePointerMoveWindow = (event) => {
      if (dragStartXRef.current === null) return;
      const diff = dragStartXRef.current - event.clientX;

      if (Math.abs(diff) > 70) {
        if (diff > 0) {
          showNextImage();
        } else {
          showPreviousImage();
        }
        dragStartXRef.current = event.clientX;
      }
    };

    const handlePointerUpWindow = () => {
      dragStartXRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMoveWindow);
    window.addEventListener('pointerup', handlePointerUpWindow);

    return () => {
      window.removeEventListener('pointermove', handlePointerMoveWindow);
      window.removeEventListener('pointerup', handlePointerUpWindow);
    };
  }, [viewerOpen, productData, currentImageIndex]);

  useEffect(() => {
    if (!viewerOpen || !viewerDescriptionRef.current) return;

    const descriptionElement = viewerDescriptionRef.current;
    setDescriptionHasMore(descriptionElement.scrollHeight > descriptionElement.clientHeight + 1);
  }, [viewerOpen, productData]);

  useEffect(() => {
    if (!productData || !detailDescriptionRef.current) return;

    const descriptionElement = detailDescriptionRef.current;
    setDetailDescriptionHasMore(descriptionElement.scrollHeight > descriptionElement.clientHeight + 1);
  }, [productData]);

  const openImageViewer = (index) => {
    if (!productData || !productData.image || productData.image.length === 0) return;
    setCurrentImageIndex(index);
    setImage(productData.image[index]);
    setDescriptionExpanded(false);
    if (!viewerHistoryRef.current) {
      window.history.pushState({ imageViewer: true }, '');
      viewerHistoryRef.current = true;
    }
    setViewerOpen(true);
  };

  const changeImageByDirection = (direction) => {
    if (!productData || !productData.image || productData.image.length === 0) return;

    setCurrentImageIndex((prevIndex) => {
      const nextIndex = direction === 'next'
        ? (prevIndex + 1) % productData.image.length
        : (prevIndex - 1 + productData.image.length) % productData.image.length;

      setImage(productData.image[nextIndex]);
      return nextIndex;
    });
  };

  const showNextImage = () => {
    changeImageByDirection('next');
  };

  const showPreviousImage = () => {
    changeImageByDirection('prev');
  };

  const handlePointerDown = (event) => {
    dragStartXRef.current = event.clientX;
  };

  const handlePointerUp = () => {
    dragStartXRef.current = null;
  };

  const handleWheelNavigation = (event) => {
    if (Math.abs(event.deltaX) > 25 || Math.abs(event.deltaY) > 25) {
      if (event.deltaX < 0 || event.deltaY < 0) {
        showNextImage();
      } else {
        showPreviousImage();
      }
    }
  };

  const handleReviewFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    setReviewFiles(files);
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const maxDimension = 900;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);

      let quality = 0.72;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      while (dataUrl.length > 180000 && quality > 0.35) {
        quality -= 0.07;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      while (dataUrl.length > 180000 && canvas.width > 480) {
        canvas.width = Math.round(canvas.width * 0.8);
        canvas.height = Math.round(canvas.height * 0.8);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL('image/jpeg', 0.55);
      }

      resolve(dataUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to read image'));
    };
    image.src = objectUrl;
  });

  const fetchReviews = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/review/list', { productId }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.log('Failed to fetch reviews:', error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }

    if (!reviewComment.trim()) {
      toast.error('Please write a review');
      return;
    }

    if (reviewRating === 0) {
      toast.error('Please select at least one star');
      return;
    }

    try {
      const imageUrls = reviewFiles.length > 0
        ? await Promise.all(reviewFiles.map(file => fileToDataUrl(file)))
        : [];

      const payload = {
        productId,
        rating: reviewRating,
        comment: reviewComment,
        images: imageUrls
      };

      const response = await axios.post(backendUrl + '/api/review/add', payload, { headers: { token } });

      if (response.data.success) {
        setReviewComment('');
        setReviewRating(0);
        setReviewFiles([]);
        setShowReviewForm(false);
        await fetchReviews();
        toast.success('Review submitted successfully!');
      } else {
        toast.error(response.data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to submit review');
    }
  };

  if (!products || !productData) {
    return <div className="text-center py-10 text-gray-500">{t.loadingProduct}</div>;
  }

  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviewCount
    : 0;
  const roundedAverageRating = Math.round(averageRating);

  const orderedSizes = [...(productData.sizes || [])].sort((a, b) => {
    const clothingOrder = clothingSizes.indexOf(a) >= 0 ? clothingSizes.indexOf(a) : Number.MAX_SAFE_INTEGER;
    const footwearOrder = footwearSizes.indexOf(a) >= 0 ? footwearSizes.indexOf(a) : Number.MAX_SAFE_INTEGER;
    const clothingOrderB = clothingSizes.indexOf(b) >= 0 ? clothingSizes.indexOf(b) : Number.MAX_SAFE_INTEGER;
    const footwearOrderB = footwearSizes.indexOf(b) >= 0 ? footwearSizes.indexOf(b) : Number.MAX_SAFE_INTEGER;

    const orderA = clothingOrder !== Number.MAX_SAFE_INTEGER ? clothingOrder : footwearOrder;
    const orderB = clothingOrderB !== Number.MAX_SAFE_INTEGER ? clothingOrderB : footwearOrderB;
    return orderA - orderB;
  });

  return (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>

      {/* Product Data */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/* Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
            <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-start gap-3 sm:gap-0 sm:w-[18.7%] w-full'>
            {productData.image.map((item, index) => (
              <WatermarkedImage watermarked={Boolean(productData.logoWatermarked)} onClick={() => { setImage(item); setCurrentImageIndex(index); openImageViewer(index); if (imageRef.current) imageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} src={item} key={index} wrapperClassName='w-[24%] sm:w-full sm:mb-3 flex-shrink-0' className='w-full cursor-pointer' alt="" />
            ))}
          </div>
          <div ref={imageRef} className='w-full sm:w-[80%]'>
            <WatermarkedImage watermarked={Boolean(productData.logoWatermarked)} onClick={() => openImageViewer(currentImageIndex)} className='w-full h-auto cursor-zoom-in' src={image} alt="" />
          </div>
        </div>

        {/* Details */}
        <div className='flex-1'>
          <h1
            className='font-medium text-2xl mt-2'
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
            }}
          >
            {productData.name}
          </h1>
          <div className='flex items-center gap-1 mt-2'>
            {[...Array(5)].map((_, i) => (
              <img
                src={i < roundedAverageRating ? assets.star_icon : assets.star_dull_icon}
                alt=""
                key={i}
                className="w-3.5"
              />
            ))}
            <p className='pl-2'>({reviewCount})</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{formatPrice(productData.price)}</p>
          <p
            ref={detailDescriptionRef}
            className='mt-5 w-full max-w-full break-all text-gray-500 md:w-4/5'
            style={detailDescriptionExpanded ? undefined : {
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {productData.description}
          </p>
          {detailDescriptionHasMore && (
            <button
              type='button'
              onClick={() => setDetailDescriptionExpanded((expanded) => !expanded)}
              className='mt-2 block max-w-full text-left text-sm font-medium text-orange-600 underline cursor-pointer'
            >
              {detailDescriptionExpanded ? 'Read less' : 'Read more'}
            </button>
          )}

          {productData.outOfStock && (
            <div className='mt-5 inline-block rounded bg-red-100 text-red-700 px-3 py-2 text-sm font-medium'>
              Out of stock
            </div>
          )}

          {/* Render Size Section ONLY if sizes exist */}
          {!productData.outOfStock && orderedSizes.length > 0 && (
            <div className='flex flex-col gap-4 my-8'>
              <p>{t.selectSize}</p>
              <div className='flex gap-2 flex-wrap'>
                {orderedSizes.map((item, index) => (
                  <button 
                    onClick={() => setSize(item)} 
                    className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500 bg-orange-50 font-semibold' : ''}`} 
                    key={index}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!productData.outOfStock ? (
            <button 
              onClick={() => {
                const hasSizeOptions = productData.sizes && productData.sizes.length > 0;

                if (hasSizeOptions && !size) {
                  toast.error('Please select the size');
                  return;
                }

                addToCart(productData._id, hasSizeOptions ? size : 'default');
              }} 
              className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700 mt-6 cursor-pointer'
            >
              {t.addToCart}
            </button>
          ) : (
            <button 
              disabled
              className='bg-gray-300 text-gray-600 px-8 py-3 text-sm mt-6 cursor-not-allowed'
            >
              {t.outOfStock}
            </button>
          )}
          
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>{t.originalProducts}</p>
            <p>{t.codAvailable}</p>
            <p>{t.easyReturn}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className='mt-20'>
        <div className='flex'>
          <button
            type='button'
            onClick={() => setActiveInfoTab('description')}
            className={`border px-5 py-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 ${activeInfoTab === 'description' ? 'font-semibold' : ''}`}
          >
            {t.description}
          </button>
          <button
            type='button'
            onClick={() => setActiveInfoTab('reviews')}
            className={`border px-5 py-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 ${activeInfoTab === 'reviews' ? 'font-semibold' : ''}`}
          >
            {t.reviews} ({reviews.length})
          </button>
        </div>
        {activeInfoTab === 'description' ? (
          <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500 dark:text-slate-300'>
            <p className='whitespace-pre-wrap break-words max-h-[260px] overflow-y-auto pr-2'>{productData.description}</p>
          </div>
        ) : (
          <div className='border px-6 py-6 text-sm text-gray-500 dark:text-slate-300'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold'>{t.customerReviews}</h3>
              {token ? (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className='bg-black text-white px-6 py-2 text-sm rounded cursor-pointer hover:bg-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600'
                >
                  {showReviewForm ? t.cancel : t.writeReview}
                </button>
              ) : (
                <button
                  type='button'
                  onClick={() => navigate('/login')}
                  className='bg-black text-white px-6 py-2 text-sm rounded cursor-pointer hover:bg-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600'
                >
                  Login to write a review
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && token && (
          <form onSubmit={handleReviewSubmit} className='border rounded-lg p-6 mb-6 bg-gray-50 dark:bg-slate-900 dark:border-slate-700'>
            <div className='mb-4'>
              <label className='block text-sm font-medium mb-2'>{t.rating}</label>
              <div className='flex gap-2'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type='button'
                    onClick={() => setReviewRating(star)}
                    className={`text-2xl transition-colors ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium mb-2'>{t.yourReview}</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={t.shareExperience}
                className='w-full border rounded-lg p-3 text-sm outline-none focus:border-black dark:bg-slate-800 dark:border-slate-600 dark:text-white'
                rows='4'
              />
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium mb-2'>{t.uploadPhotos}</label>
              <input
                type='file'
                multiple
                accept='image/*'
                onChange={handleReviewFileChange}
                className='w-full border rounded-lg p-3 text-sm dark:bg-slate-800 dark:border-slate-600'
              />
              {reviewFiles.length > 0 && (
                <div className='mt-2 flex gap-2'>
                  {reviewFiles.map((file, idx) => (
                    <div key={idx} className='relative'>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`review-${idx}`}
                        className='w-20 h-20 object-cover rounded'
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type='submit'
              className='w-full bg-black text-white py-2 rounded font-medium hover:bg-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600'
            >
              Submit Review
            </button>
          </form>
        )}

          {/* Display Reviews */}
          <div className='space-y-4'>
          {reviews.length === 0 ? (
            <p className='text-gray-500 dark:text-slate-400 text-center py-8'>No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className='border rounded-lg p-4 bg-white dark:bg-slate-800 dark:border-slate-700'>
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className='text-xs text-gray-500 dark:text-slate-400'>{review.date}</span>
                </div>
                <p className='mb-1 text-sm font-semibold dark:text-slate-100'>{review.userName || 'Customer'}</p>
                <p className='text-sm mb-3 dark:text-slate-200'>{review.comment}</p>
                {review.images && review.images.length > 0 && (
                  <div className='flex gap-2 flex-wrap'>
                    {review.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`review-img-${idx}`}
                        className='w-24 h-24 object-cover rounded cursor-pointer hover:opacity-80'
                        onClick={() => {
                          setReviewViewerImages(review.images);
                          setReviewViewerIndex(idx);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
            </div>
          </div>
        )}
      </div>

      {viewerOpen && (
        <div className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4' onClick={closeImageViewer}>
          <div
            className='relative w-full max-w-4xl max-h-[95vh] overflow-y-auto'
            onClick={(event) => event.stopPropagation()}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheelNavigation}
          >
            <button
              type='button'
              className='absolute -top-12 right-0 text-white text-3xl leading-none cursor-pointer'
              aria-label='Close image viewer'
              onClick={closeImageViewer}
            >
              ×
            </button>
            <WatermarkedImage
              watermarked={Boolean(productData.logoWatermarked)}
              src={productData.image[currentImageIndex]}
              alt='Product view'
              className='max-h-[70vh] w-full object-contain rounded-lg shadow-2xl cursor-grab active:cursor-grabbing select-none'
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onClick={(event) => {
                event.stopPropagation();
                showNextImage();
              }}
            />
            <div className='mt-4 text-white text-sm'>
              <p
                ref={viewerDescriptionRef}
                className='whitespace-pre-wrap break-words'
                style={descriptionExpanded ? undefined : {
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {productData.description}
              </p>
              {descriptionHasMore && (
                <button
                  type='button'
                  className='mt-2 text-orange-300 underline cursor-pointer'
                  onClick={() => setDescriptionExpanded((expanded) => !expanded)}
                >
                  {descriptionExpanded ? 'Read less' : 'Read more'}
                </button>
              )}
            </div>
            <div className='mt-4 text-center text-white text-sm'>
              {currentImageIndex + 1} / {productData.image.length}
            </div>
          </div>
        </div>
      )}

      {reviewViewerImages.length > 0 && (
        <div
          className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4'
          onClick={() => setReviewViewerImages([])}
        >
          <button
            type='button'
            className='absolute top-4 right-5 text-white text-4xl leading-none cursor-pointer'
            aria-label='Close review image viewer'
            onClick={() => setReviewViewerImages([])}
          >
            ×
          </button>
          <img
            src={reviewViewerImages[reviewViewerIndex]}
            alt='Review full size'
            className='max-h-[90vh] max-w-full object-contain rounded-lg cursor-pointer select-none'
            onPointerDown={(event) => {
              reviewViewerStartXRef.current = event.clientX;
              reviewViewerMovedRef.current = false;
            }}
            onPointerUp={(event) => {
              if (reviewViewerStartXRef.current === null) return;
              const distance = reviewViewerStartXRef.current - event.clientX;
              reviewViewerStartXRef.current = null;
              if (Math.abs(distance) > 50 && reviewViewerImages.length > 1) {
                reviewViewerMovedRef.current = true;
                setReviewViewerIndex((currentIndex) => (
                  distance > 0
                    ? (currentIndex + 1) % reviewViewerImages.length
                    : (currentIndex - 1 + reviewViewerImages.length) % reviewViewerImages.length
                ));
              }
            }}
            onClick={(event) => {
              event.stopPropagation();
              if (reviewViewerMovedRef.current) {
                reviewViewerMovedRef.current = false;
                return;
              }
              if (reviewViewerImages.length > 1) {
                setReviewViewerIndex((currentIndex) => (currentIndex + 1) % reviewViewerImages.length);
              }
            }}
          />
          <div className='absolute bottom-6 left-0 right-0 text-center text-sm text-white'>
            {reviewViewerIndex + 1} / {reviewViewerImages.length}
          </div>
        </div>
      )}

      {/* Related Products */}
      <RelatedProduct category={productData.category} subCategory={productData.subCategory} />
    </div>
  );
}

export default Product;

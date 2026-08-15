import { useEffect, useRef, useState } from 'react';

const quickReplies = [
  'Delivery time',
  'Return policy',
  'Track my order',
  'Contact support',
];

const localKnowledge = [
  {
    keywords: ['delivery', 'shipping', 'dispatch', 'order time', 'when will'],
    reply:
      'Delivery usually takes up to 10 days from the date of dispatch. We aim to process and ship your order quickly, and you will receive updates once it is on the way.',
  },
  {
    keywords: ['return', 'refund', 'exchange', 'cancel'],
    reply:
      'Our return policy is simple: items can be returned within 7 days of delivery in original condition with tags and packaging intact. Exchange requests are reviewed on a case-by-case basis, and approved returns are processed within 5–7 business days.',
  },
  {
    keywords: ['track', 'tracking', 'order status', 'where is my order', 'my order'],
    reply:
      'To track your order, go to the Orders page after logging in. There you can view the current status, item details, shipping updates, and order information. If you need extra help, contact support with your order ID.',
  },
  {
    keywords: ['contact', 'support', 'help', 'issue', 'problem'],
    reply:
      'For support, email us at foreverglobal.new@gmail.com. Our team will assist you with order, shipping, return, and payment-related queries. You can also message us anytime with your order details for quick help.',
  },
  {
    keywords: ['message', 'msg', 'chat'],
    reply:
      'You can message us anytime for help with orders, shipping, or returns. Please share your order ID and the issue you are facing, and we will guide you quickly.',
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    reply:
      'Hi! I am Forever Assistant. I can help with delivery time, return policy, tracking your order, and support. Ask me anything.',
  },
];

const getLocalReply = (message) => {
  const lowerText = message.toLowerCase();
  const matched = localKnowledge.find(({ keywords }) =>
    keywords.some((keyword) => lowerText.includes(keyword))
  );

  if (matched) {
    return matched.reply;
  }

  return 'Hi! You can ask about delivery time, return policy, order tracking, or contact support. For support, email us at foreverglobal.new@gmail.com. Messages are usually answered quickly.';
};

const getStatusSummary = (status = 'Order Placed') => {
  const normalized = status?.trim();

  if (!normalized) {
    return 'Your order has been placed and is waiting to be packed.';
  }

  const statusMap = {
    'Order Placed': 'Your order has been placed and is waiting to be packed.',
    Packing: 'Your order is currently being packed and prepared for shipment.',
    Shipped: 'Your order has been shipped and is on the way to the delivery address.',
    'Out for delivery': 'Your order is out for delivery and should reach you soon.',
    Delivered: 'Your order has been delivered successfully.',
    Cancelled: 'This order has been cancelled and is no longer in transit.',
  };

  return statusMap[normalized] || `Your order is currently in ${normalized} status.`;
};

const extractOrderId = (input) => {
  const matches = input.match(/(?:order\s*(?:id|number)|orderid|order)\s*[:#-]?\s*([a-fA-F0-9]{8,24})/i);
  if (matches?.[1]) return matches[1];

  const hexMatch = input.match(/\b([a-fA-F0-9]{24})\b/);
  return hexMatch?.[1] || null;
};

const getTrackOrderReply = async () => {
  const token = localStorage.getItem('token');
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  if (!token) {
    return 'Please log in first so I can check your recent order details and shipment status.';
  }

  try {
    const response = await fetch(`${backendUrl}/api/order/userorders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    const orders = Array.isArray(data?.orders) ? data.orders : [];

    if (!orders.length) {
      return 'I could not find any recent order for this account yet. Please place an order first, then I can track it for you.';
    }

    const latestOrder = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const items = latestOrder?.items || [];
    const itemNames = items.map((item) => item.name).filter(Boolean).slice(0, 2);
    const orderLabel = itemNames.length ? itemNames.join(', ') : 'your item';
    const status = latestOrder?.status || 'Order Placed';
    const orderId = latestOrder?._id ? latestOrder._id.slice(-6).toUpperCase() : 'N/A';

    return `Your latest order #${orderId} for ${orderLabel} is currently in ${status} status. ${getStatusSummary(status)} If you want, I can also help you with the next update or contact support.`;
  } catch (error) {
    console.error('Track order fetch failed:', error);
    return 'I could not fetch your order right now, but you can check it from the Orders page. If needed, email support at foreverglobal.new@gmail.com.';
  }
};

const getOrderLookupReply = async (orderId) => {
  const token = localStorage.getItem('token');
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  if (!token) {
    return 'Please log in first so I can look up your order by ID.';
  }

  try {
    const response = await fetch(`${backendUrl}/api/order/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token,
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await response.json();
    if (!data?.success || !data.order) {
      return 'I could not find that order ID on your account. Please check the order ID from your Orders page or contact support.';
    }

    const order = data.order;
    const items = Array.isArray(order.items) ? order.items : [];
    const names = items.map((item) => item.name).filter(Boolean).slice(0, 2);
    const itemLabel = names.length ? names.join(', ') : 'your item';
    const status = order.status || 'Order Placed';
    const readableId = order._id || orderId;

    return `Order ${readableId} is currently in ${status} status. ${getStatusSummary(status)} It includes ${itemLabel}.`;
  } catch (error) {
    console.error('Order lookup failed:', error);
    return 'I could not fetch that order details right now. Please confirm the ID and try again or check the Orders page.';
  }
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi! I am Forever Assistant. Ask me about delivery time, return policy, order tracking, or support.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoading, isOpen]);

  const sendMessage = async (inputText) => {
    const text = inputText.trim();
    if (!text) return;

    const userMessage = { sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setIsLoading(true);

    const lowerText = text.toLowerCase();
    const extractedOrderId = extractOrderId(text);
    const isTrackRequest =
      lowerText.includes('track my order') ||
      lowerText.includes('track order') ||
      lowerText.includes('tracking') ||
      lowerText.includes('where is my order') ||
      lowerText.includes('my order');

    if (extractedOrderId) {
      try {
        const orderReply = await getOrderLookupReply(extractedOrderId);
        setMessages((prev) => [...prev, { sender: 'bot', text: orderReply }]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'I could not fetch that order details right now. Please check the Orders page or contact support.' },
        ]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isTrackRequest) {
      try {
        const trackingReply = await getTrackOrderReply();
        setMessages((prev) => [...prev, { sender: 'bot', text: trackingReply }]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'I could not fetch your order status right now. Please check your Orders page or contact support.' },
        ]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const instantReply = getLocalReply(text);
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'bot', text: instantReply }]);
      setIsLoading(false);
    }, 150);

    if (import.meta.env.VITE_OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'You are a helpful e-commerce customer support assistant for a fashion store. Keep answers concise, friendly, and focused on shipping, returns, and orders. Use the store email foreverglobal.new@gmail.com when mentioning support.',
              },
              { role: 'user', content: text },
            ],
            temperature: 0.7,
            max_tokens: 200,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiReply = data?.choices?.[0]?.message?.content?.trim();
          if (aiReply) {
            setMessages((prev) => {
              const filtered = prev.filter((msg) => msg.sender !== 'bot' || msg.text !== instantReply);
              return [...filtered, { sender: 'bot', text: aiReply }];
            });
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.log('OpenAI request failed, using fallback reply:', error);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className='fixed bottom-5 right-5 z-50'>
      {isOpen ? (
        <div className='w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-900'>
          <div className='flex items-center justify-between bg-slate-900 px-4 py-3 text-white dark:bg-slate-800'>
            <div>
              <p className='text-xs uppercase tracking-[0.2em] text-slate-300'>Forever</p>
              <p className='text-sm font-semibold'>AI Assistant</p>
            </div>
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='rounded-full bg-white/10 px-2 py-1 text-xs text-white transition hover:bg-white/15'
            >
              Close
            </button>
          </div>

          <div className='flex max-h-[420px] flex-col gap-3 bg-slate-50 p-3 dark:bg-slate-950'>
            <div className='space-y-2 overflow-y-auto pr-1'>
              {messages.map((message, index) => (
                <div
                  key={`${message.sender}-${index}`}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.sender === 'user'
                      ? 'ml-auto bg-slate-900 text-white dark:bg-slate-700'
                      : 'bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {message.text}
                </div>
              ))}

              {isLoading && (
                <div className='max-w-[85%] rounded-2xl bg-white px-3 py-2 text-sm text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300'>
                  Typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className='flex flex-wrap gap-2'>
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type='button'
                  onClick={() => {
                    setIsOpen(true);
                    sendMessage(reply);
                  }}
                  className='rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                >
                  {reply}
                </button>
              ))}
            </div>

            <div className='mt-1 flex gap-2'>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage(draft);
                  }
                }}
                placeholder='Type your question...'
                className='flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
              />
              <button
                type='button'
                onClick={() => sendMessage(draft)}
                className='rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600'
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => setIsOpen(true)}
          className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-slate-900 to-slate-700 text-xl shadow-[0_16px_35px_rgba(15,23,42,0.25)] transition hover:scale-105 dark:from-slate-700 dark:to-slate-500'
          aria-label='Open AI assistant'
        >
          ✦
        </button>
      )}
    </div>
  );
};

export default ChatBot;

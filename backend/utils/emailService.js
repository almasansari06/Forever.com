import nodemailer from 'nodemailer';

const transporter = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: Number(process.env.EMAIL_PORT || 587) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

const sendMail = async ({ to, subject, html, text, attachments = [] }) => {
  if (!transporter) {
    console.log(`Email skipped for ${to}. Configure SMTP credentials in .env to enable email delivery.`);
    return { success: false, skipped: true };
  }

  try {
    await transporter.sendMail({
      from: `"Forever" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || text || '',
      attachments,
    });

    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async ({ to, name }) => {
  if (!to) return { success: false, skipped: true };

  const subject = 'Welcome to Forever';
  const text = `Hi ${name || 'there'},\n\nThank you for creating your account with Forever. We are glad to have you with us.\n\nYour account is ready and you can start shopping now.\n\nRegards,\nForever Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
      <h2 style="color: #111;">Welcome to Forever</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Thank you for creating your account with Forever. We are glad to have you with us.</p>
      <p>Your account is ready and you can start shopping now.</p>
      <p>Regards,<br />Forever Team</p>
    </div>
  `;

  return sendMail({ to, subject, text, html });
};

export const sendOrderEmail = async ({ to, name, order }) => {
  if (!to || !order) return { success: false, skipped: true };

  const itemsHtml = (order.items || [])
    .map((item) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">${item.name || 'Product'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #eee; text-align: right;">$${Number(item.price || 0).toFixed(2)}</td>
      </tr>
    `)
    .join('');

  const subject = 'Your Forever order details';
  const text = `Hi ${name || 'there'},\n\nYour order has been placed successfully.\nOrder ID: ${order._id || 'N/A'}\nTotal Amount: $${Number(order.amount || 0).toFixed(2)}\nPayment Method: ${order.paymentMethod || 'COD'}\n\nShipping Address:\n${order.address ? `${order.address.street || ''}, ${order.address.city || ''}, ${order.address.state || ''}, ${order.address.country || ''}` : 'N/A'}\n\nRegards,\nForever Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
      <h2 style="color: #111;">Your Forever order details</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Your order has been placed successfully.</p>
      <p><strong>Order ID:</strong> ${order._id || 'N/A'}</p>
      <p><strong>Total Amount:</strong> $${Number(order.amount || 0).toFixed(2)}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod || 'COD'}</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <p><strong>Shipping Address:</strong><br />
        ${order.address ? `${order.address.street || ''}, ${order.address.city || ''}, ${order.address.state || ''}, ${order.address.country || ''}` : 'N/A'}
      </p>

      <p>Regards,<br />Forever Team</p>
    </div>
  `;

  return sendMail({ to, subject, text, html });
};

export const sendOrderStatusEmail = async ({ to, name, order, status, customMessage }) => {
  if (!to || !order) return { success: false, skipped: true };

  const cancellationText = customMessage || order.cancelledMessage ||
    (order.cancelledBy === 'admin'
      ? 'Due to some technical issue, your order has been cancelled.'
      : 'Your order has been cancelled successfully.');

  const statusMap = {
    Packing: 'Your order is being packed',
    Shipped: 'Your order has been shipped',
    'Out for delivery': 'Your order is out for delivery',
    Delivered: customMessage || 'Your order has been delivered successfully.',
    Cancelled: cancellationText,
    'Cancellation Requested': 'Your cancellation request has been received'
  };

  const label = statusMap[status] || customMessage || 'Your order status has been updated';
  const subject = `Forever: ${label}`;
  const text = `Hi ${name || 'there'},\n\n${label}.\nOrder ID: ${order._id || 'N/A'}\nCurrent Status: ${status || 'Updated'}\n\nThank you for shopping with Forever.\n\nRegards,\nForever Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
      <h2 style="color: #111;">${label}</h2>
      <p>Hi ${name || 'there'},</p>
      <p>${label}</p>
      <p><strong>Order ID:</strong> ${order._id || 'N/A'}</p>
      <p><strong>Current Status:</strong> ${status || 'Updated'}</p>
      <p>Thank you for shopping with Forever.</p>
      <p>Regards,<br />Forever Team</p>
    </div>
  `;

  return sendMail({ to, subject, text, html });
};

export const sendJobApplicationEmail = async ({ to, firstName, lastName }) => {
  if (!to || !firstName) return { success: false, skipped: true };

  const subject = 'Application Received - Forever';
  const text = `Thank you for applying to Forever!\n\nDear ${firstName} ${lastName || ''},\n\nWe appreciate your interest in joining the Forever family. We have received your application and will review it thoroughly.\n\nIf your profile matches our requirements, our HR team will get in touch with you within 5-7 business days.\n\nBest regards,\nForever Global Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
      <h2 style="color: #111;">Thank You for Applying to Forever!</h2>
      <p>Dear ${firstName} ${lastName || ''},</p>
      <p>We appreciate your interest in joining the Forever family. We have received your application and will review it thoroughly.</p>
      <p>If your profile matches our requirements, our HR team will get in touch with you within 5-7 business days. We wish you the best and hope to connect with you soon!</p>
      <br/>
      <p>Best regards,<br/>Forever Global Team</p>
    </div>
  `;

  return sendMail({ to, subject, text, html });
};

export const sendJobApplicationToAdmin = async ({ firstName, lastName, email, contact, state, city, address, aadharNumber, whyJoin, resumeFileName, resumeBuffer, resumeMimeType }) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'foreverglobal.new@gmail.com';

  const subject = `New Job Application from ${firstName} ${lastName}`;
  const text = `New job application received.\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nContact: ${contact}\nState: ${state}\nCity: ${city}\nAddress: ${address}\nAadhar: ${aadharNumber}\nWhy they want to join: ${whyJoin}\nResume: ${resumeFileName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
      <h2 style="color: #111;">New Job Application Received</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Contact:</strong> ${contact}</p>
      <p><strong>State:</strong> ${state}</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Aadhar Number:</strong> ${aadharNumber}</p>
      <p><strong>Why they want to join:</strong> ${whyJoin}</p>
      <p><strong>Resume:</strong> ${resumeFileName}</p>
      <p><strong>Applied At:</strong> ${new Date().toLocaleString()}</p>
    </div>
  `;

  const attachments = resumeBuffer && resumeFileName
    ? [{
        filename: resumeFileName,
        content: Buffer.from(resumeBuffer),
        contentType: resumeMimeType || 'application/octet-stream',
      }]
    : [];

  return sendMail({ to: adminEmail, subject, text, html, attachments });
};

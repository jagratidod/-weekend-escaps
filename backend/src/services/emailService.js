import nodemailer from 'nodemailer';

const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  const port = parseInt(process.env.SMTP_PORT || '2525', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (!user || user === 'your_smtp_user') {
    return null; // Test mode / no valid credentials configured
  }

  return nodemailer.createTransport({
    host,
    port,
    auth: { user, pass },
  });
};

/**
 * Send booking and payment confirmation receipt to customer
 */
export const sendBookingConfirmationEmail = async (booking, payment) => {
  try {
    const primary = booking.primaryContact || {};
    if (!primary.email) return;

    const transporter = getTransporter();
    const from = process.env.EMAIL_FROM || 'Weekend Escapes <bookings@weekendescapes.com>';
    const subject = `Booking Confirmed: ${booking.bookingRef} – ${booking.packageName}`;

    const paidAmount = payment?.amount || booking.pricing?.amountPaidNow || 0;
    const remainingBalance = booking.pricing?.remainingBalance || 0;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1A384C 0%, #2C5E7A 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">Weekend Escapes</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Your Adventure Awaits!</p>
        </div>

        <div style="padding: 24px;">
          <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0; color: #065F46; font-weight: bold; font-size: 15px;">✓ Payment Verified & Booking Confirmed</p>
            <p style="margin: 4px 0 0; color: #047857; font-size: 13px;">Booking Ref: <strong>${booking.bookingRef}</strong></p>
          </div>

          <h3 style="color: #0f172a; margin-top: 0;">Hi ${primary.name},</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            Thank you for booking with Weekend Escapes! We have received your payment via PhonePe. Here is your trip summary:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Package / Trek:</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #0f172a;">${booking.packageName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Departure Date:</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #0f172a;">${booking.friendlyTravelDate || booking.travelDate}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Travelers:</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #0f172a;">${booking.totalPersons} Person(s)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Amount Paid (PhonePe):</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #10B981;">₹${paidAmount.toLocaleString('en-IN')}</td>
            </tr>
            ${
              remainingBalance > 0
                ? `<tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b;">Remaining at Basecamp:</td>
                    <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #EA580C;">₹${remainingBalance.toLocaleString('en-IN')}</td>
                  </tr>`
                : ''
            }
          </table>

          <div style="background: #F8FAFC; border-radius: 8px; padding: 14px; margin-top: 20px; font-size: 13px; color: #64748b;">
            <p style="margin: 0;">Our trek coordinator will contact you 48 hours prior to departure for group sync and briefing.</p>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Weekend Escapes Adventure Tours • Need help? Reply to this email or message us on WhatsApp.
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`[Email Simulation] To: ${primary.email} | Subject: "${subject}" | Ref: ${booking.bookingRef}`);
      return;
    }

    await transporter.sendMail({
      from,
      to: primary.email,
      subject,
      html,
    });
    console.log(`[Email Sent] Confirmation dispatched to ${primary.email} for ${booking.bookingRef}`);
  } catch (error) {
    console.error('[Email Error] Failed to send booking confirmation:', error.message);
  }
};

import nodemailer from 'nodemailer';

const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!user || user === 'your_smtp_user' || user === 'your_email@gmail.com') {
    return null; // Simulation / dev mode until user configures credentials
  }

  // Gmail specific or custom SMTP
  if (host.includes('gmail') || process.env.SMTP_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
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

/**
 * Send Offline Registration Confirmation Email to Customer
 * Matches user's exact template with dynamic company & booking variables
 */
export const sendOfflineRegistrationEmail = async (booking) => {
  try {
    const primary = booking.primaryContact || {};
    if (!primary.email) {
      console.warn('[Offline Email] No recipient email found for booking:', booking.bookingRef);
      return;
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const companyName = process.env.COMPANY_NAME || 'Weekend Escapes';
    const companyPhone = process.env.COMPANY_PHONE || '+91 6375372499';
    const companyWebsite = process.env.COMPANY_WEBSITE || 'weekendescapes.com';
    const rawTerms = process.env.COMPANY_TERMS_URL || `${clientUrl}/terms`;
    const companySignature = process.env.COMPANY_SIGNATURE || `Team ${companyName}`;

    const cleanWebsiteUrl = companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`;
    const cleanTermsUrl = rawTerms.startsWith('http')
      ? rawTerms
      : `${clientUrl.replace(/\/$/, '')}/${rawTerms.replace(/^\//, '')}`;
    const cleanPhoneDigits = companyPhone.replace(/\D/g, '');

    const customerName = primary.name || 'Traveler';
    const tripName = booking.packageName || 'Expedition';
    const tripDate = booking.friendlyTravelDate || booking.travelDate || 'Upcoming Date';
    const travelersCount = booking.totalPersons || (booking.travelers ? booking.travelers.length : 1);

    // Exact plain text layout requested by user
    const textContent = `Hey ${customerName}!

We've received your details and you're all set for:
Trip: ${tripName}
Date: ${tripDate}
Travelers: ${travelersCount}
━━━━━━━━━━━━━━━━━━━━
Our team will reach out on WhatsApp with your final trip instructions closer to departure.

Got questions? WhatsApp us anytime:
${companyPhone}

Trip guidelines & policies:
${cleanTermsUrl}
━━━━━━━━━━━━━━━━━━━━
See you on the mountains!
${companySignature}
${companyWebsite}`;

    const subject = `You're all set for ${tripName}!`;
    const from = process.env.EMAIL_FROM || `"${companyName}" <bookings@${companyWebsite.replace(/https?:\/\//, '')}>`;

    // Elegant matching responsive HTML template
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
          <div style="display: inline-block; background: rgba(255, 107, 22, 0.15); border: 1px solid rgba(255, 107, 22, 0.3); padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #ff8a4c; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;">
            Booking Verified & Locked
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">${companyName}</h1>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px;">
          <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a;">Hey ${customerName}!</h2>
          <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #475569;">
            We've received your details and you're all set for:
          </p>

          <!-- Trip Highlight Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Trip:</td>
                <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0f172a; font-size: 16px;">${tripName}</td>
              </tr>
              <tr style="border-top: 1px dashed #e2e8f0;">
                <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Date:</td>
                <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0f172a;">${tripDate}</td>
              </tr>
              <tr style="border-top: 1px dashed #e2e8f0;">
                <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Travelers:</td>
                <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0f172a;">${travelersCount}</td>
              </tr>
              ${
                booking.paymentDetails?.utrNumber
                  ? `<tr style="border-top: 1px dashed #e2e8f0;">
                      <td style="padding: 8px 0; color: #64748b; font-weight: 500;">UTR / Ref:</td>
                      <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #0284c7; font-family: monospace;">${booking.paymentDetails.utrNumber}</td>
                    </tr>`
                  : ''
              }
            </table>
          </div>

          <div style="border-top: 1px solid #e2e8f0; margin: 24px 0;"></div>

          <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569;">
            Our team will reach out on WhatsApp with your final trip instructions closer to departure.
          </p>

          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #0f172a;">
            Got questions? WhatsApp us anytime:
          </p>
          <div style="margin-bottom: 20px;">
            <a href="https://wa.me/${cleanPhoneDigits}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              💬 WhatsApp: ${companyPhone}
            </a>
          </div>

          <p style="margin: 20px 0 8px; font-size: 13px; color: #64748b;">
            Trip guidelines &amp; policies:<br />
            <a href="${cleanTermsUrl}" style="color: #ff6b16; text-decoration: underline; font-weight: 600;">${companyTerms}</a>
          </p>

          <div style="border-top: 1px solid #e2e8f0; margin: 24px 0;"></div>

          <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">
            See you on the mountains!
          </p>
          <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">
            ${companySignature}<br />
            <a href="${cleanWebsiteUrl}" style="color: #0f172a; text-decoration: none; font-weight: 600;">${companyWebsite}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 16px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          This is an automated booking confirmation from ${companyName}.
        </div>
      </div>
    `;

    const transporter = getTransporter();

    if (!transporter) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`[Offline Registration Email - SIMULATION MODE]`);
      console.log(`To: ${primary.email}`);
      console.log(`Subject: ${subject}`);
      console.log('--- Plain Text Content ---');
      console.log(textContent);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return { simulated: true, to: primary.email, subject };
    }

    const info = await transporter.sendMail({
      from,
      to: primary.email,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`[Email Sent] Offline registration confirmation sent to ${primary.email}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Offline Email Error] Failed to send email:', error.message);
    return { error: error.message };
  }
};

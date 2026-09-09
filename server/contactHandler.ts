import nodemailer from 'nodemailer';

export interface ContactPayload {
  name: string;
  email: string;
  service?: string;
  message: string;
  phone?: string;
  turnstileToken?: string;
}

export interface ContactHandlerResult {
  ok: boolean;
  status: number;
  message: string;
  details?: any;
}

export async function verifyTurnstileToken(
  token: string,
  clientIp?: string
): Promise<{ success: boolean; errorCodes?: string[] }> {
  const secretKey =
    process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

  if (!token) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (clientIp) {
      formData.append('remoteip', clientIp);
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const result = (await response.json()) as {
      success: boolean;
      'error-codes'?: string[];
    };

    return {
      success: Boolean(result.success),
      errorCodes: result['error-codes'],
    };
  } catch (error) {
    console.error('Turnstile verification request error:', error);
    // In local dev without internet, allow graceful fallback if using dummy key
    if (secretKey.startsWith('1x0000')) {
      return { success: true };
    }
    return { success: false, errorCodes: ['network-error'] };
  }
}

export async function handleContactSubmission(
  payload: ContactPayload,
  clientIp?: string
): Promise<ContactHandlerResult> {
  const { name, email, service = 'General Inquiry', message, phone = 'N/A', turnstileToken } = payload;

  // Validation
  if (!name || !name.trim()) {
    return { ok: false, status: 400, message: 'Please provide your name.' };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { ok: false, status: 400, message: 'Please provide a valid email address.' };
  }

  if (!message || !message.trim()) {
    return { ok: false, status: 400, message: 'Please provide a message or project details.' };
  }

  // Cloudflare Turnstile Verification
  if (!turnstileToken) {
    return {
      ok: false,
      status: 400,
      message: 'Please complete the Cloudflare CAPTCHA verification.',
    };
  }

  const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp);
  if (!turnstileCheck.success) {
    return {
      ok: false,
      status: 400,
      message: 'CAPTCHA verification failed. Please try again.',
      details: turnstileCheck.errorCodes,
    };
  }

  // SMTP Configuration
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const toEmail = process.env.CONTACT_TO_EMAIL || 'info@plexivia.online';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      background-color: #0C1618;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 30px 15px;
      color: #F5F7F7;
    }
    .card {
      max-width: 580px;
      margin: 0 auto;
      background: #0F1E22;
      border: 1px solid rgba(88, 193, 195, 0.25);
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    }
    .header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      background: rgba(88, 193, 195, 0.15);
      color: #58C1C3;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border: 1px solid rgba(88, 193, 195, 0.3);
      margin-bottom: 10px;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      color: #F5F7F7;
      margin: 0;
    }
    .field-row {
      margin-bottom: 18px;
    }
    .field-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #58C1C3;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .field-value {
      font-size: 14px;
      color: #F5F7F7;
      line-height: 1.6;
      background: #0C1618;
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 10px 14px;
      border-radius: 10px;
      word-break: break-word;
    }
    .message-box {
      white-space: pre-wrap;
      font-family: inherit;
    }
    .footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 20px;
      margin-top: 28px;
      text-align: center;
      font-size: 11px;
      color: rgba(245, 247, 247, 0.4);
    }
    .footer strong {
      color: #97CC6F;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">Plexivia Contact System</div>
      <h1 class="title">New Project Inquiry</h1>
    </div>

    <div class="field-row">
      <div class="field-label">Client Name</div>
      <div class="field-value">${escapeHtml(name.trim())}</div>
    </div>

    <div class="field-row">
      <div class="field-label">Email Address</div>
      <div class="field-value"><a href="mailto:${escapeHtml(email.trim())}" style="color: #58C1C3; text-decoration: none;">${escapeHtml(email.trim())}</a></div>
    </div>

    ${
      phone && phone !== 'N/A'
        ? `
    <div class="field-row">
      <div class="field-label">Phone Number</div>
      <div class="field-value">${escapeHtml(phone.trim())}</div>
    </div>`
        : ''
    }

    <div class="field-row">
      <div class="field-label">Service Requested</div>
      <div class="field-value" style="color: #97CC6F; font-weight: 600;">${escapeHtml(service)}</div>
    </div>

    <div class="field-row">
      <div class="field-label">Message / Project Details</div>
      <div class="field-value message-box">${escapeHtml(message.trim())}</div>
    </div>

    <div class="footer">
      Delivered directly via <strong>Plexivia Secure Contact Gateway</strong> • Client IP: ${escapeHtml(clientIp || 'N/A')}
    </div>
  </div>
</body>
</html>
`;

  // Check if SMTP is configured
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn(
      '[Plexivia Contact] SMTP credentials not configured in environment variables. Message simulated successfully in dev mode:',
      { name, email, service, phone }
    );
    return {
      ok: true,
      status: 200,
      message: 'Inquiry received successfully! (Simulated mode: please configure SMTP in .env for live delivery)',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });

    const mailOptions = {
      from: `"Plexivia Portal" <${smtpUser}>`,
      to: toEmail,
      replyTo: `"${name.trim()}" <${email.trim()}>`,
      subject: `New Project Inquiry: ${service} - ${name.trim()}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\n\nMessage:\n${message}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return {
      ok: true,
      status: 200,
      message: 'Thank you! Your inquiry has been sent directly to our engineering team.',
    };
  } catch (error: any) {
    console.error('[Plexivia Contact] SMTP dispatch error:', error);
    return {
      ok: false,
      status: 500,
      message: 'Failed to send email via SMTP server. Please check SMTP configuration or contact us directly via WhatsApp.',
      details: error?.message,
    };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

import nodemailer from 'nodemailer';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create primary SMTP transporter with environment configuration and reliable fallbacks
const createPrimaryTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.zoho.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || 'info@plexivia.online';
  const pass = process.env.SMTP_PASS || 'The4HorseMen@@';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
  });
};

// Create secondary fallback SMTP transporter
const createFallbackTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_FALLBACK_HOST || 'mail.privateemail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_FALLBACK_USER || 'support@plexihub.space',
      pass: process.env.SMTP_FALLBACK_PASS || 'VXfc-5qGJ-s5qE-VqHN-Wktx-saSv',
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
  });
};

// Generate high fidelity HTML template for OTP verification emails
export const renderOtpEmailHtml = (otpCode: string, recipientEmail: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Plexivia Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #121214; border-radius: 16px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #09090b 0%, #18181b 100%); padding: 32px 32px 24px 32px; border-bottom: 1px solid #27272a; text-align: center;">
              <div style="font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase; margin-bottom: 4px;">
                PLEXIVIA
              </div>
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #38bdf8; text-transform: uppercase;">
                Identity & Access Management
              </div>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">
                One-Time Verification Code
              </h2>
              <p style="font-size: 13px; line-height: 22px; color: #a1a1aa; margin: 0 0 24px 0;">
                You are receiving this code to verify your sign-in attempt for account <strong style="color: #e4e4e7;">${recipientEmail}</strong>. Please enter the verification code below to proceed:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #09090b; border: 1.5px solid #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
                <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; display: inline-block;">
                  ${otpCode}
                </span>
              </div>

              <!-- Expiry & Security Notice -->
              <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size: 12px; color: #a1a1aa; line-height: 18px;">
                      ⏱️ <strong>Expiration:</strong> This verification code is valid for <strong>3 minutes</strong> only.<br />
                      🛡️ <strong>Security Tip:</strong> Never share this code with anyone. Plexivia staff will never ask for your authentication codes.
                    </td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 11px; color: #71717a; line-height: 18px; margin: 0;">
                If you did not initiate this authentication request, please secure your administrative account or contact your administrator immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #09090b; padding: 20px 32px; border-top: 1px solid #27272a; text-align: center;">
              <p style="font-size: 11px; color: #52525b; margin: 0;">
                © 2026 Plexivia Ecosystem. All rights reserved. • High Security Vault
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Generate high fidelity HTML template for MFA authenticator QR setup emails
export const renderMfaEmailHtml = (secretKey: string, qrCodeImageUrl: string, recipientEmail: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Configure Multi-Factor Authentication</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #121214; border-radius: 16px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #09090b 0%, #18181b 100%); padding: 32px 32px 24px 32px; border-bottom: 1px solid #27272a; text-align: center;">
              <div style="font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase; margin-bottom: 4px;">
                PLEXIVIA
              </div>
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #38bdf8; text-transform: uppercase;">
                Multi-Factor Authenticator Setup
              </div>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px; text-align: center;">
              <h2 style="font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">
                Setup Two-Factor Authenticator
              </h2>
              <p style="font-size: 13px; line-height: 22px; color: #a1a1aa; margin: 0 0 24px 0; text-align: left;">
                Scan the QR code below using your preferred authenticator application (Google Authenticator, Microsoft Authenticator, 1Password, or Apple Keychain) for account <strong style="color: #e4e4e7;">${recipientEmail}</strong>:
              </p>

              <!-- QR Code Display Frame -->
              <div style="background-color: #ffffff; border-radius: 12px; padding: 16px; display: inline-block; margin: 0 auto 24px auto; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
                <img src="${qrCodeImageUrl}" alt="Plexivia MFA QR Code" width="200" height="200" style="display: block; width: 200px; height: 200px;" />
              </div>

              <!-- Manual Key Input -->
              <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 10px; padding: 16px; margin-bottom: 24px; text-align: left;">
                <div style="font-size: 11px; font-weight: 700; color: #71717a; text-transform: uppercase; margin-bottom: 6px;">
                  Manual Setup Key (If unable to scan)
                </div>
                <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 15px; font-weight: 700; color: #38bdf8; letter-spacing: 2px;">
                  ${secretKey}
                </div>
              </div>

              <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 14px 16px; text-align: left;">
                <p style="font-size: 12px; color: #a1a1aa; line-height: 18px; margin: 0;">
                  🔒 Once scanned, your authenticator app will generate a fresh 6-digit rolling code every 30 seconds for all future logins.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #09090b; padding: 20px 32px; border-top: 1px solid #27272a; text-align: center;">
              <p style="font-size: 11px; color: #52525b; margin: 0;">
                © 2026 Plexivia Ecosystem. All rights reserved. • Enterprise IAM
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Dispatch transactional email with automatic secondary fallback handler
export const sendMail = async (options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const fromAddress = process.env.SMTP_FROM || '"Plexivia Security" <info@plexivia.online>';

  try {
    const primary = createPrimaryTransporter();
    const info = await primary.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
    });
    console.log(`✅ [MAILER] Email sent successfully to ${options.to} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (primaryError: any) {
    console.warn(`⚠️ [MAILER] Primary SMTP failed: ${primaryError.message}. Attempting fallback transporter...`);

    try {
      const fallback = createFallbackTransporter();
      const info = await fallback.sendMail({
        from: '"Plexivia Support" <support@plexihub.space>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
      });
      console.log(`✅ [MAILER-FALLBACK] Email sent successfully to ${options.to} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (fallbackError: any) {
      console.error(`❌ [MAILER] Both primary and fallback SMTP failed: ${fallbackError.message}`);
      return { success: false, error: fallbackError.message };
    }
  }
};

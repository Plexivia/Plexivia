import nodemailer from 'nodemailer';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string;
  replyTo?: string;
  inReplyTo?: string;
  references?: string;
}

export interface TeamInviteEmailParams {
  fullName: string;
  email: string;
  role: string;
  department: string;
  tempPassword: string;
  loginUrl?: string;
}

// Create primary SMTP transporter from environment configuration
const createPrimaryTransporter = () => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Primary SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)');
  }
  const port = Number(process.env.SMTP_PORT) || 465;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
  });
};

// Create secondary fallback SMTP transporter, or null when not configured
const createFallbackTransporter = () => {
  const { SMTP_FALLBACK_HOST, SMTP_FALLBACK_USER, SMTP_FALLBACK_PASS } = process.env;
  if (!SMTP_FALLBACK_HOST || !SMTP_FALLBACK_USER || !SMTP_FALLBACK_PASS) {
    return null;
  }
  const port = Number(process.env.SMTP_FALLBACK_PORT) || 465;

  return nodemailer.createTransport({
    host: SMTP_FALLBACK_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_FALLBACK_USER, pass: SMTP_FALLBACK_PASS },
    connectionTimeout: 10000,
  });
};

// Shared light email layout: white card on a soft gray background, readable in every mail client
const renderEmailLayout = (title: string, label: string, body: string): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #e5e7eb; text-align: center;">
              <div style="font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #0f172a;">PLEXIVIA</div>
              <div style="font-size: 12px; font-weight: 600; letter-spacing: 0.5px; color: #0369a1; margin-top: 4px;">${label}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 32px;">
${body}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 18px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #6b7280; margin: 0;">© 2026 Plexivia. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// Generate HTML template for OTP verification emails
export const renderOtpEmailHtml = (otpCode: string, recipientEmail: string): string =>
  renderEmailLayout(
    'Your Plexivia Verification Code',
    'Sign-in verification',
    `              <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Your verification code</h1>
              <p style="font-size: 15px; line-height: 24px; color: #374151; margin: 0 0 24px 0;">
                Use this code to sign in to <strong style="color: #111827;">${recipientEmail}</strong>:
              </p>
              <div style="background-color: #f0f9ff; border: 2px solid #0284c7; border-radius: 10px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
                <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #0c4a6e;">${otpCode}</span>
              </div>
              <p style="font-size: 14px; line-height: 22px; color: #374151; margin: 0 0 8px 0;">
                This code expires in <strong>3 minutes</strong>.
              </p>
              <p style="font-size: 14px; line-height: 22px; color: #374151; margin: 0 0 20px 0;">
                Never share this code with anyone. Plexivia staff will never ask for it.
              </p>
              <p style="font-size: 13px; line-height: 20px; color: #6b7280; margin: 0;">
                If you did not try to sign in, you can ignore this email and consider changing your password.
              </p>`
  );

// Generate HTML template for MFA authenticator QR setup emails
export const renderMfaEmailHtml = (secretKey: string, qrCodeImageUrl: string, recipientEmail: string): string =>
  renderEmailLayout(
    'Set up your authenticator app',
    'Two-factor authentication setup',
    `              <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Set up your authenticator app</h1>
              <p style="font-size: 15px; line-height: 24px; color: #374151; margin: 0 0 24px 0;">
                Scan this QR code with Google Authenticator, Microsoft Authenticator, 1Password or Apple Passwords for <strong style="color: #111827;">${recipientEmail}</strong>.
              </p>
              <div style="text-align: center; margin: 0 0 24px 0;">
                <img src="${qrCodeImageUrl}" alt="Authenticator QR code" width="200" height="200" style="display: inline-block; width: 200px; height: 200px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; background-color: #ffffff;" />
              </div>
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 0 0 24px 0;">
                <div style="font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Can't scan? Enter this key</div>
                <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 16px; font-weight: 700; color: #0c4a6e; letter-spacing: 2px; word-break: break-all;">${secretKey}</div>
              </div>
              <p style="font-size: 14px; line-height: 22px; color: #374151; margin: 0 0 8px 0;">
                After scanning, enter the 6-digit code from the app on the sign-in page to finish setup.
              </p>
              <p style="font-size: 13px; line-height: 20px; color: #6b7280; margin: 0;">
                Keep this email private. Anyone with this key can generate your sign-in codes.
              </p>`
  );

// Generate HTML template for new team member invitation and credentials delivery
export const renderTeamInviteEmailHtml = (params: TeamInviteEmailParams): string => {
  const portalUrl = params.loginUrl || 'https://admin.plexivia.com';
  return renderEmailLayout(
    'You Have Been Invited to Plexivia Dashboard',
    'Team Member Invitation',
    `              <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Welcome to the team, ${params.fullName}!</h1>
              <p style="font-size: 15px; line-height: 24px; color: #374151; margin: 0 0 20px 0;">
                You have been enrolled in the <strong>Plexivia Engineering &amp; Operations Portal</strong> as <strong>${params.role}</strong> (${params.department}).
              </p>
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px; margin: 0 0 22px 0;">
                <div style="font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Your Sign-In Credentials</div>
                <div style="font-size: 14px; line-height: 22px; color: #111827; margin-bottom: 6px;">
                  <strong>Login Email:</strong> <span style="font-family: 'SFMono-Regular', Consolas, monospace; color: #0369a1;">${params.email}</span>
                </div>
                <div style="font-size: 14px; line-height: 22px; color: #111827;">
                  <strong>Temporary Password:</strong> <span style="font-family: 'SFMono-Regular', Consolas, monospace; font-weight: 700; color: #0c4a6e; background-color: #e0f2fe; padding: 2px 8px; border-radius: 4px;">${params.tempPassword}</span>
                </div>
              </div>
              <div style="text-align: center; margin: 0 0 22px 0;">
                <a href="${portalUrl}" style="display: inline-block; background-color: #0284c7; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px;">Sign In to Plexivia Portal</a>
              </div>
              <p style="font-size: 13px; line-height: 20px; color: #374151; margin: 0 0 8px 0;">
                You can sign in using your email and temporary password (with 2FA email OTP verification), or use <strong>Login with OTP</strong> directly on the login screen.
              </p>
              <p style="font-size: 12px; line-height: 18px; color: #6b7280; margin: 0;">
                Portal URL: <a href="${portalUrl}" style="color: #0284c7; text-decoration: none;">${portalUrl}</a>
              </p>`
  );
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
      cc: options.cc,
      replyTo: options.replyTo,
      inReplyTo: options.inReplyTo,
      references: options.references,
    });
    console.log(`✅ [MAILER] Email sent successfully to ${options.to} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (primaryError: any) {
    console.warn(`⚠️ [MAILER] Primary SMTP failed: ${primaryError.message}. Attempting fallback transporter...`);

    try {
      const fallback = createFallbackTransporter();
      if (!fallback) {
        throw primaryError;
      }
      const info = await fallback.sendMail({
        from: process.env.SMTP_FALLBACK_FROM || process.env.SMTP_FALLBACK_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
        cc: options.cc,
        replyTo: options.replyTo,
        inReplyTo: options.inReplyTo,
        references: options.references,
      });
      console.log(`✅ [MAILER-FALLBACK] Email sent successfully to ${options.to} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (fallbackError: any) {
      console.error(`❌ [MAILER] Both primary and fallback SMTP failed: ${fallbackError.message}`);
      return { success: false, error: fallbackError.message };
    }
  }
};

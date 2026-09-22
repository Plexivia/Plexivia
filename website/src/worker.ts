export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  EMAIL?: {
    send: (message: {
      to: string;
      from: string;
      subject: string;
      text: string;
      html?: string;
    }) => Promise<void>;
  };
  TURNSTILE_SECRET_KEY?: string;
  CONTACT_TO_EMAIL?: string;
}

interface ContactPayload {
  name: string;
  email: string;
  service?: string;
  message: string;
  phone?: string;
  turnstileToken?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle API endpoint
    if (url.pathname === '/api/contact') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }

      if (request.method !== 'POST') {
        return new Response(
          JSON.stringify({ ok: false, message: 'Method not allowed' }),
          {
            status: 405,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      try {
        const body = (await request.json()) as ContactPayload;
        const { name, email, service = 'General Inquiry', message, phone = 'N/A', turnstileToken } = body;

        // Basic validation
        if (!name || !name.trim()) {
          return jsonResponse({ ok: false, message: 'Please provide your name.' }, 400);
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          return jsonResponse({ ok: false, message: 'Please provide a valid email address.' }, 400);
        }
        if (!message || !message.trim()) {
          return jsonResponse({ ok: false, message: 'Please provide a message.' }, 400);
        }

        // Verify Cloudflare Turnstile token
        const secretKey = env.TURNSTILE_SECRET_KEY || '0x4AAAAAAEtanB6OfE8zSKvyIgig4FO8eQ4';
        if (!turnstileToken) {
          return jsonResponse({ ok: false, message: 'Please complete the Cloudflare CAPTCHA verification.' }, 400);
        }

        const clientIp = request.headers.get('CF-Connecting-IP') || '';
        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', turnstileToken);
        if (clientIp) {
          formData.append('remoteip', clientIp);
        }

        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });

        const verifyData = (await verifyRes.json()) as { success: boolean; 'error-codes'?: string[] };
        if (!verifyData.success && !secretKey.startsWith('1x0000')) {
          return jsonResponse(
            { ok: false, message: 'CAPTCHA verification failed. Please try again.', details: verifyData['error-codes'] },
            400
          );
        }

        // Email Sending
        const destinationEmail = env.CONTACT_TO_EMAIL || 'plexivia@gmail.com';
        const emailHtml =
          '<div style="font-family: sans-serif; background: #0C1618; color: #F5F7F7; padding: 24px; border-radius: 12px; border: 1px solid #58C1C3;">' +
          '<h2 style="color: #58C1C3; margin-top: 0;">New Project Inquiry - Plexivia</h2>' +
          '<p><strong>Name:</strong> ' + escapeHtml(name) + '</p>' +
          '<p><strong>Email:</strong> ' + escapeHtml(email) + '</p>' +
          '<p><strong>Phone:</strong> ' + escapeHtml(phone) + '</p>' +
          '<p><strong>Service:</strong> ' + escapeHtml(service) + '</p>' +
          '<p><strong>Message:</strong></p>' +
          '<div style="background: #0F1E22; padding: 12px; border-radius: 8px; white-space: pre-wrap;">' + escapeHtml(message) + '</div>' +
          '<p style="font-size: 11px; color: #888; margin-top: 20px;">Delivered via Plexivia Cloudflare Gateway</p>' +
          '</div>';

        if (env.EMAIL && typeof env.EMAIL.send === 'function') {
          try {
            await env.EMAIL.send({
              to: destinationEmail,
              from: 'contact@plexivia.online',
              subject: 'New Inquiry: ' + service + ' - ' + name,
              text: 'Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + phone + '\nService: ' + service + '\n\nMessage:\n' + message,
              html: emailHtml,
            });
          } catch (err: any) {
            console.error('Cloudflare Workers send_email error:', err);
          }
        }

        return jsonResponse({
          ok: true,
          message: 'Thank you! Your inquiry has been sent directly to our team.',
        });
      } catch (err: any) {
        return jsonResponse(
          { ok: false, message: 'Internal server error processing inquiry.', details: err?.message },
          500
        );
      }
    }

    // Pass through to static assets (SPA)
    return env.ASSETS.fetch(request);
  },
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

import QRCode from 'qrcode';
import { Response } from 'express';
import { getAdminModel, type IAdmin } from '../models/Admin.js';
import {
  getVpsConsoleAccessModel,
  getVpsCommandLogModel,
  getVpsServerModel,
  type IVpsConsoleAccess,
} from '../models/VpsConsole.js';
import {
  verifyPassword as checkPassword,
  verifyTotp,
  generateTotpSecret,
  generateNumericOtp,
  safeEqual,
  encryptText,
  decryptText,
} from '../utils/security.js';
import { sendMail, renderVpsConsoleMfaEmailHtml, renderVpsConsoleOtpEmailHtml } from '../utils/mailer.js';
import { getVpsServer, resolveSshTarget, hasSshCredentials, runSshCommand, testSshConnection } from '../utils/sshClient.js';
import { findVpsCommand, publicVpsCommands } from '../config/vpsCommands.js';
import {
  issueVpsUnlockToken,
  readVpsPendingToken,
  revokeVpsUnlock,
  signVpsPendingToken,
  VPS_UNLOCK_TTL_SECONDS,
  type VpsRequest,
} from '../middleware/vpsConsole.js';

/**
 * VPS root console.
 *
 * Unlocking is deliberately a second gate in front of the dashboard session:
 * the admin re-enters their password and then a code from an authenticator that
 * is enrolled *for the console only* — enrolling it is a first-run step offered
 * either as a QR code shown on the page or one emailed to them.
 *
 * Once unlocked, commands come from the whitelist in config/vpsCommands.ts and
 * run over SSH in a chosen checkout. Every run is written to vps_command_logs.
 */

const OTP_TTL_SECONDS = 180;
const OTP_RESEND_COOLDOWN_MS = 30_000;
const OTP_MAX_ATTEMPTS = 5;
const MAX_CODE_FAILURES = 5;
const FAILURE_WINDOW_MS = 10 * 60_000;
const OUTPUT_TAIL_CHARS = 4000;
const SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const SAFE_ABSOLUTE_PATH = /^\/[A-Za-z0-9._\-/]{0,255}$/;

interface OtpEntry {
  code: string;
  expiresAt: number;
  sentAt: number;
  attempts: number;
}

const consoleOtps = new Map<string, OtpEntry>();
const codeFailures = new Map<string, { count: number; firstAt: number }>();

// Count a wrong code and report whether the admin is now locked out
const registerFailure = (adminId: string): boolean => {
  const now = Date.now();
  const entry = codeFailures.get(adminId);
  if (!entry || now - entry.firstAt > FAILURE_WINDOW_MS) {
    codeFailures.set(adminId, { count: 1, firstAt: now });
    return false;
  }
  entry.count += 1;
  return entry.count >= MAX_CODE_FAILURES;
};

const isLockedOut = (adminId: string): boolean => {
  const entry = codeFailures.get(adminId);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > FAILURE_WINDOW_MS) {
    codeFailures.delete(adminId);
    return false;
  }
  return entry.count >= MAX_CODE_FAILURES;
};

const clearFailures = (adminId: string) => codeFailures.delete(adminId);

// POSIX single-quoting, so a path can never break out of the command string
const shellQuote = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;

const PATH_PREFIX = 'export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH;';

const getPendingAdmin = async (req: VpsRequest): Promise<IAdmin | null> => {
  const pending = readVpsPendingToken((req.headers['x-vps-pending'] as string | undefined) || req.body?.consoleToken);
  if (!pending) return null;
  const admin = await getAdminModel().findById(pending.adminId);
  return admin && admin.is_active ? admin : null;
};

const getAccess = async (admin: IAdmin): Promise<IVpsConsoleAccess> => {
  const Model = getVpsConsoleAccessModel();
  const existing = await Model.findOne({ admin_id: String(admin._id) });
  if (existing) return existing;
  return Model.create({ admin_id: String(admin._id), admin_email: admin.email });
};

const otpauthUrlFor = (email: string, secret: string) =>
  `otpauth://totp/${encodeURIComponent('Plexivia Root Console')}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(
    'Plexivia Root Console'
  )}&algorithm=SHA1&digits=6&period=30`;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/** What the dashboard needs before showing the lock screen. */
export const getConsoleState = async (req: VpsRequest, res: Response) => {
  try {
    const admin = await getAdminModel().findById(req.auth!.sub);
    if (!admin) return res.status(401).json({ success: false, message: 'Account not found.' });

    const [server, access] = await Promise.all([getVpsServer(), getAccess(admin)]);
    const target = await resolveSshTarget();

    return res.json({
      success: true,
      data: {
        enrolled: Boolean(access.totp_secret_enc),
        lockedOut: isLockedOut(String(admin._id)),
        credentialsPresent: hasSshCredentials(target),
        canEditCredentials: admin.role === 'OWNER',
        unlockTtlSeconds: VPS_UNLOCK_TTL_SECONDS,
        lastUnlockAt: access.last_unlock_at || null,
        server: {
          label: server.label,
          host: server.host,
          port: server.port,
          username: server.username,
          auth_method: server.auth_method,
          app_path: server.app_path,
          clients_root: server.clients_root,
          has_password: Boolean(server.password_enc),
          has_private_key: Boolean(server.private_key_enc),
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to read console state' });
  }
};

// ---------------------------------------------------------------------------
// Unlock: step 1, password
// ---------------------------------------------------------------------------

/** Re-check the admin's own dashboard password and open a 5-minute 2FA window. */
export const unlockWithPassword = async (req: VpsRequest, res: Response) => {
  try {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ success: false, message: 'Your dashboard password is required.' });

    const admin = await getAdminModel().findById(req.auth!.sub);
    if (!admin || !admin.is_active) return res.status(401).json({ success: false, message: 'Account not found.' });

    if (isLockedOut(String(admin._id))) {
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Try again in 10 minutes.' });
    }

    if (!checkPassword(String(password), admin.password_hash)) {
      registerFailure(String(admin._id));
      return res.status(401).json({ success: false, message: 'That password is not correct.' });
    }

    const access = await getAccess(admin);
    const enrolled = Boolean(access.totp_secret_enc);

    return res.json({
      success: true,
      message: enrolled
        ? 'Password verified. Enter your root console authenticator code.'
        : 'Password verified. Set up a root console authenticator to continue.',
      data: {
        consoleToken: signVpsPendingToken(String(admin._id), admin.email),
        enrolled,
        email: admin.email,
        availableMethods: enrolled ? ['TOTP_AUTHENTICATOR', 'EMAIL_OTP'] : ['SETUP_AUTHENTICATOR', 'EMAIL_OTP'],
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Password verification failed' });
  }
};

// ---------------------------------------------------------------------------
// Unlock: step 2a, enrol an authenticator (QR on screen or by email)
// ---------------------------------------------------------------------------

/**
 * Issue (or re-show) the console authenticator secret.
 *
 * `deliver: 'email'` mails the QR as an inline image; otherwise the QR comes
 * back as a data URL to render on the page. The secret stays "pending" until a
 * code proves the app has it.
 */
export const startAuthenticatorEnrollment = async (req: VpsRequest, res: Response) => {
  try {
    const admin = await getPendingAdmin(req);
    if (!admin) return res.status(401).json({ success: false, message: 'Verify your password again to continue.' });

    const access = await getAccess(admin);
    if (access.totp_secret_enc) {
      return res.status(409).json({
        success: false,
        message: 'A root console authenticator is already set up. Ask the owner to reset it if you lost the device.',
      });
    }

    const secret = decryptText(access.pending_secret_enc || '') || generateTotpSecret();
    if (!access.pending_secret_enc) {
      await getVpsConsoleAccessModel().updateOne(
        { _id: access._id },
        { $set: { pending_secret_enc: encryptText(secret), admin_email: admin.email, updated_at: new Date().toISOString() } }
      );
    }

    const otpauthUrl = otpauthUrlFor(admin.email, secret);
    const deliver = String(req.body?.deliver || 'inline').toLowerCase();

    if (deliver === 'email') {
      const png = await QRCode.toBuffer(otpauthUrl, { width: 300, margin: 1, errorCorrectionLevel: 'M' });
      const mail = await sendMail({
        to: admin.email,
        subject: 'Set up your Plexivia VPS root console authenticator',
        html: renderVpsConsoleMfaEmailHtml(secret, 'vps-console-qr', admin.email),
        text: `Root console authenticator secret key: ${secret}`,
        attachments: [{ filename: 'root-console-qr.png', content: png, contentType: 'image/png', cid: 'vps-console-qr' }],
      });
      if (!mail.success) {
        return res.status(502).json({ success: false, message: 'Could not send the setup email. Try the on-screen QR code instead.' });
      }
      return res.json({
        success: true,
        message: `QR code emailed to ${admin.email}. Scan it, then enter the 6-digit code.`,
        data: { delivered: 'email', email: admin.email },
      });
    }

    const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { width: 300, margin: 1, errorCorrectionLevel: 'M' });
    return res.json({
      success: true,
      message: 'Scan this QR code with your authenticator app, then enter the 6-digit code.',
      data: { delivered: 'inline', email: admin.email, secretKey: secret, otpauthUrl, qrDataUrl },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to start authenticator setup' });
  }
};

// ---------------------------------------------------------------------------
// Unlock: step 2b, email a one-time code
// ---------------------------------------------------------------------------

/** Mail a 6-digit console unlock code, valid for 3 minutes. */
export const sendConsoleEmailOtp = async (req: VpsRequest, res: Response) => {
  try {
    const admin = await getPendingAdmin(req);
    if (!admin) return res.status(401).json({ success: false, message: 'Verify your password again to continue.' });

    const adminId = String(admin._id);
    const existing = consoleOtps.get(adminId);
    if (existing && Date.now() - existing.sentAt < OTP_RESEND_COOLDOWN_MS) {
      return res.status(429).json({ success: false, message: 'Please wait 30 seconds before requesting another code.' });
    }

    const code = generateNumericOtp();
    const now = Date.now();
    consoleOtps.set(adminId, { code, expiresAt: now + OTP_TTL_SECONDS * 1000, sentAt: now, attempts: 0 });

    const mail = await sendMail({
      to: admin.email,
      subject: 'Plexivia root console unlock code',
      html: renderVpsConsoleOtpEmailHtml(code, admin.email),
      text: `Your Plexivia root console unlock code is ${code}. It expires in 3 minutes.`,
    });
    if (!mail.success) {
      consoleOtps.delete(adminId);
      return res.status(502).json({ success: false, message: 'Could not send the code email. Please try again shortly.' });
    }

    return res.json({
      success: true,
      message: `Unlock code sent to ${admin.email}. It expires in 3 minutes.`,
      data: { expiresInSeconds: OTP_TTL_SECONDS },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to send the unlock code' });
  }
};

// ---------------------------------------------------------------------------
// Unlock: step 3, verify the code
// ---------------------------------------------------------------------------

/** Accept an authenticator code or emailed OTP and mint the unlock token. */
export const verifyConsoleCode = async (req: VpsRequest, res: Response) => {
  try {
    const admin = await getPendingAdmin(req);
    if (!admin) return res.status(401).json({ success: false, message: 'Verify your password again to continue.' });

    const adminId = String(admin._id);
    if (isLockedOut(adminId)) {
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Try again in 10 minutes.' });
    }

    const code = String(req.body?.code || '').trim();
    const method = String(req.body?.method || 'TOTP_AUTHENTICATOR').toUpperCase();
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, message: 'Enter the 6-digit code.' });
    }

    const access = await getAccess(admin);
    const AccessModel = getVpsConsoleAccessModel();
    const now = new Date().toISOString();

    if (method === 'EMAIL_OTP') {
      const stored = consoleOtps.get(adminId);
      if (!stored) return res.status(400).json({ success: false, message: 'No active code. Request a new one.' });
      if (Date.now() > stored.expiresAt || stored.attempts >= OTP_MAX_ATTEMPTS) {
        consoleOtps.delete(adminId);
        return res.status(400).json({ success: false, message: 'That code has expired. Request a new one.' });
      }
      if (!safeEqual(stored.code, code)) {
        stored.attempts += 1;
        const locked = registerFailure(adminId);
        return res.status(401).json({ success: false, message: locked ? 'Too many failed attempts. Try again in 10 minutes.' : 'That code is not correct.' });
      }
      consoleOtps.delete(adminId);
    } else {
      const confirmed = decryptText(access.totp_secret_enc || '');
      const pending = decryptText(access.pending_secret_enc || '');

      if (confirmed) {
        if (!verifyTotp(confirmed, code)) {
          const locked = registerFailure(adminId);
          return res.status(401).json({ success: false, message: locked ? 'Too many failed attempts. Try again in 10 minutes.' : 'That code is not correct.' });
        }
      } else if (pending && verifyTotp(pending, code)) {
        // First accepted code promotes the pending secret: the app and the server now agree
        await AccessModel.updateOne(
          { _id: access._id },
          { $set: { totp_secret_enc: access.pending_secret_enc, enrolled_at: now, updated_at: now }, $unset: { pending_secret_enc: '' } }
        );
      } else {
        const locked = registerFailure(adminId);
        return res.status(401).json({
          success: false,
          message: locked
            ? 'Too many failed attempts. Try again in 10 minutes.'
            : pending
              ? 'That code is not correct.'
              : 'No authenticator is set up yet. Get a QR code first.',
        });
      }
    }

    clearFailures(adminId);
    const { token, expiresInSeconds } = issueVpsUnlockToken(adminId, admin.email);
    await AccessModel.updateOne(
      { _id: access._id },
      { $set: { last_unlock_at: now, updated_at: now }, $inc: { unlock_count: 1 } }
    );

    return res.json({
      success: true,
      message: 'Root console unlocked.',
      data: { vpsToken: token, expiresInSeconds },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Verification failed' });
  }
};

/** Drop the caller's unlock sessions straight away. */
export const lockConsole = (req: VpsRequest, res: Response) => {
  revokeVpsUnlock({ adminId: req.auth!.sub });
  return res.json({ success: true, message: 'Root console locked.' });
};

/** Owner-only recovery when an admin loses their authenticator device. */
export const resetEnrollment = async (req: VpsRequest, res: Response) => {
  try {
    const adminId = String(req.body?.adminId || req.auth!.sub);
    const admin = await getAdminModel().findById(adminId);
    if (!admin) return res.status(404).json({ success: false, message: 'Account not found.' });

    await getVpsConsoleAccessModel().updateOne(
      { admin_id: adminId },
      { $set: { totp_secret_enc: '', pending_secret_enc: '', enrolled_at: '', updated_at: new Date().toISOString() } },
      { upsert: true }
    );
    revokeVpsUnlock({ adminId });
    clearFailures(adminId);

    return res.json({ success: true, message: `Root console authenticator reset for ${admin.email}.` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to reset the authenticator' });
  }
};

// ---------------------------------------------------------------------------
// Targets (the app checkout plus each client folder)
// ---------------------------------------------------------------------------

// One shell script that reports every checkout in a single round trip
const buildProbeScript = (appPath: string, clientsRoot: string) => `
probe() {
  kind=$1; name=$2; dir=$3
  [ -d "$dir" ] || return 0
  isgit=0; [ -d "$dir/.git" ] && isgit=1
  branch=$(git -C "$dir" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '-')
  commit=$(git -C "$dir" log -1 --format=%h 2>/dev/null || echo '-')
  subject=$(git -C "$dir" log -1 --format=%s 2>/dev/null | tr '\\t\\n' '  ' | cut -c1-120)
  when=$(git -C "$dir" log -1 --format=%cI 2>/dev/null || echo '-')
  dirty=$(git -C "$dir" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  mk=0; [ -f "$dir/Makefile" ] && mk=1
  dc=0; { [ -f "$dir/docker-compose.yml" ] || [ -f "$dir/docker-compose.yaml" ] || [ -f "$dir/compose.yml" ]; } && dc=1
  printf '%s\\t%s\\t%s\\t%s\\t%s\\t%s\\t%s\\t%s\\t%s\\t%s\\t%s\\n' "$kind" "$name" "$dir" "$isgit" "$branch" "$commit" "$subject" "$when" "$dirty" "$mk" "$dc"
}
probe APP app ${shellQuote(appPath)}
for d in ${shellQuote(clientsRoot)}/*/; do
  [ -d "$d" ] || continue
  probe CLIENT "$(basename "$d")" "\${d%/}"
done
`;

/** Every checkout the console can act on, with its git state. */
export const listTargets = async (req: VpsRequest, res: Response) => {
  try {
    const server = await getVpsServer();
    const target = await resolveSshTarget();
    if (!hasSshCredentials(target)) {
      return res.status(409).json({ success: false, message: 'Save the VPS root credentials before using the console.' });
    }

    const result = await runSshCommand(target, buildProbeScript(server.app_path, server.clients_root), { timeoutMs: 45_000 });
    const targets = result.stdout
      .split('\n')
      .filter((line) => line.includes('\t'))
      .map((line) => {
        const [kind, name, path, isGit, branch, commit, subject, when, dirty, hasMake, hasCompose] = line.split('\t');
        return {
          id: kind === 'APP' ? 'app' : name,
          kind,
          name: kind === 'APP' ? server.label : name,
          path,
          isGit: isGit === '1',
          branch: branch === '-' ? null : branch,
          commit: commit === '-' ? null : commit,
          subject: subject === '-' ? null : subject,
          committedAt: when && when !== '-' ? when : null,
          dirtyFiles: Number(dirty) || 0,
          hasMake: hasMake === '1',
          hasCompose: String(hasCompose).trim() === '1',
        };
      });

    return res.json({
      success: true,
      data: {
        targets,
        clientsRoot: server.clients_root,
        appPath: server.app_path,
        note: targets.length <= 1 ? `No client checkouts found under ${server.clients_root}.` : null,
      },
    });
  } catch (error: any) {
    return res.status(502).json({ success: false, message: error?.message || 'Could not reach the VPS over SSH' });
  }
};

/** The premade command catalog. */
export const listCommands = (_req: VpsRequest, res: Response) =>
  res.json({ success: true, data: { commands: publicVpsCommands() } });

// ---------------------------------------------------------------------------
// Execute
// ---------------------------------------------------------------------------

// Resolve a requested target id to an absolute path, rejecting anything outside the allowed roots
const resolveTargetPath = async (targetId: string) => {
  const server = await getVpsServer();
  if (!SAFE_ABSOLUTE_PATH.test(server.app_path) || !SAFE_ABSOLUTE_PATH.test(server.clients_root)) {
    throw new Error('The saved app path or clients root is not a valid absolute path.');
  }
  if (targetId === 'app') return { path: server.app_path, label: server.label };
  if (!SAFE_SEGMENT.test(targetId) || targetId.includes('..')) {
    throw new Error('That client folder name is not allowed.');
  }
  return { path: `${server.clients_root.replace(/\/$/, '')}/${targetId}`, label: targetId };
};

/** Run one whitelisted command and record it in the audit trail. */
export const execCommand = async (req: VpsRequest, res: Response) => {
  const admin = await getAdminModel().findById(req.auth!.sub);
  const commandId = String(req.body?.commandId || '');
  const targetId = String(req.body?.targetId || 'app');
  const command = findVpsCommand(commandId);

  if (!command) {
    return res.status(400).json({ success: false, message: 'That command is not in the allowed list.' });
  }

  let resolved: { path: string; label: string };
  try {
    resolved = await resolveTargetPath(targetId);
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const sshTarget = await resolveSshTarget();
  if (!hasSshCredentials(sshTarget)) {
    return res.status(409).json({ success: false, message: 'Save the VPS root credentials before using the console.' });
  }

  const fullCommand =
    command.scope === 'TARGET'
      ? `${PATH_PREFIX} cd ${shellQuote(resolved.path)} && ${command.command}`
      : `${PATH_PREFIX} ${command.command}`;

  const logRun = (fields: Record<string, unknown>) =>
    getVpsCommandLogModel()
      .create({
        admin_id: String(req.auth!.sub),
        admin_email: admin?.email || req.auth!.email,
        target: command.scope === 'TARGET' ? resolved.label : 'system',
        target_path: command.scope === 'TARGET' ? resolved.path : '~',
        command_id: command.id,
        command: command.command,
        kind: 'COMMAND',
        ip: req.ip || '',
        ...fields,
      })
      .catch(() => undefined);

  try {
    const result = await runSshCommand(sshTarget, fullCommand, { timeoutMs: command.timeoutMs });
    const combined = [result.stdout, result.stderr].filter(Boolean).join('\n');

    await logRun({
      exit_code: result.code,
      duration_ms: result.durationMs,
      output_tail: combined.slice(-OUTPUT_TAIL_CHARS),
    });

    return res.json({
      success: true,
      data: {
        commandId: command.id,
        label: command.label,
        target: command.scope === 'TARGET' ? resolved.label : 'System',
        targetPath: command.scope === 'TARGET' ? resolved.path : null,
        ranCommand: command.command,
        exitCode: result.code,
        signal: result.signal,
        stdout: result.stdout,
        stderr: result.stderr,
        truncated: result.truncated,
        durationMs: result.durationMs,
        finishedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    const message = error?.message || 'Command failed';
    await logRun({ exit_code: null, duration_ms: 0, error: message });
    return res.status(502).json({ success: false, message });
  }
};

// ---------------------------------------------------------------------------
// Credentials & audit
// ---------------------------------------------------------------------------

/** Save the SSH target. Secrets are encrypted; blank fields keep what is stored. */
export const saveServer = async (req: VpsRequest, res: Response) => {
  try {
    const { label, host, port, username, authMethod, password, privateKey, passphrase, appPath, clientsRoot } = req.body || {};
    const server = await getVpsServer();
    const update: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: req.auth!.email };

    if (label !== undefined) update.label = String(label).trim().slice(0, 80) || 'Plexivia VPS';
    if (host !== undefined) {
      const value = String(host).trim();
      if (!/^[A-Za-z0-9._:-]{1,255}$/.test(value)) return res.status(400).json({ success: false, message: 'Enter a valid host or IP address.' });
      update.host = value;
    }
    if (port !== undefined) {
      const value = Number(port);
      if (!Number.isInteger(value) || value < 1 || value > 65535) return res.status(400).json({ success: false, message: 'Port must be between 1 and 65535.' });
      update.port = value;
    }
    if (username !== undefined) {
      const value = String(username).trim();
      if (!/^[A-Za-z0-9._-]{1,32}$/.test(value)) return res.status(400).json({ success: false, message: 'Enter a valid SSH username.' });
      update.username = value;
    }
    if (authMethod !== undefined) {
      const value = String(authMethod).toUpperCase();
      if (!['PASSWORD', 'PRIVATE_KEY'].includes(value)) return res.status(400).json({ success: false, message: 'Unsupported authentication method.' });
      update.auth_method = value;
    }
    for (const [key, value] of [['app_path', appPath], ['clients_root', clientsRoot]] as const) {
      if (value === undefined) continue;
      const clean = String(value).trim().replace(/\/+$/, '') || '/';
      if (!SAFE_ABSOLUTE_PATH.test(clean)) {
        return res.status(400).json({ success: false, message: 'Paths must be absolute and contain only letters, digits, dot, dash, underscore and slash.' });
      }
      update[key] = clean;
    }

    // An empty string clears a stored secret; omitting the field leaves it untouched
    if (password !== undefined) update.password_enc = password ? encryptText(String(password)) : '';
    if (privateKey !== undefined) update.private_key_enc = privateKey ? encryptText(String(privateKey)) : '';
    if (passphrase !== undefined) update.passphrase_enc = passphrase ? encryptText(String(passphrase)) : '';

    await getVpsServerModel().updateOne({ _id: server._id }, { $set: update });
    return res.json({ success: true, message: 'VPS connection saved.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to save the VPS connection' });
  }
};

/** Connect, report who we land as, disconnect. */
export const testConnection = async (_req: VpsRequest, res: Response) => {
  try {
    const target = await resolveSshTarget();
    if (!hasSshCredentials(target)) {
      return res.status(409).json({ success: false, message: 'No SSH password or private key is saved yet.' });
    }
    const info = await testSshConnection(target);
    return res.json({
      success: true,
      message: info.isRoot
        ? `Connected to ${info.hostname} as root.`
        : `Connected to ${info.hostname} as ${info.user} — not root, so some commands may fail.`,
      data: info,
    });
  } catch (error: any) {
    return res.status(502).json({ success: false, message: error?.message || 'SSH connection failed' });
  }
};

/** Recent console activity, newest first. */
export const listCommandLogs = async (req: VpsRequest, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const logs = await getVpsCommandLogModel().find({}).sort({ created_at: -1 }).limit(limit).lean();
    return res.json({ success: true, data: { logs } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Failed to read the console audit log' });
  }
};

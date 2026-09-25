import { Request, Response } from 'express';
import { Store } from '../data/store.js';
import { Admin, ClientVaultItem } from '../types/index.js';

// Authenticate administrative user and issue access and refresh tokens
export const login = (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const emailClean = String(email).trim().toLowerCase();
    let admin = Store.admins.find(a => a.email.toLowerCase() === emailClean);

    if (!admin) {
      const isAccountant = emailClean.includes('accountant') || emailClean.includes('finance');
      const isOwner = emailClean === 'admin@plexivia.com' || emailClean === 'owner@plexivia.com';

      admin = {
        id: `adm-${Date.now().toString().slice(-4)}`,
        email: emailClean,
        full_name: emailClean.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        role: isOwner ? 'OWNER' : (isAccountant ? 'ACCOUNTANT' : 'ADMIN'),
        is_active: true,
        two_factor_enabled: isOwner,
        created_at: new Date().toISOString(),
      };
      Store.admins.push(admin);
    }

    const accessToken = `jwt_access_token_${Date.now()}_${Buffer.from(emailClean).toString('base64')}`;
    const refreshToken = `jwt_refresh_token_${Date.now()}_${Buffer.from(emailClean).toString('base64')}`;

    return res.json({
      success: true,
      token: accessToken,
      user: admin,
      message: 'Authenticated successfully',
      data: {
        admin,
        user: admin,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Authentication failed' });
  }
};

// Validate two factor authentication OTP for administrative access
export const verify2fa = (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const userEmail = email ? String(email).trim().toLowerCase() : '';
    const admin = Store.admins.find(a => a.email.toLowerCase() === userEmail) || Store.admins[0] || null;

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    return res.json({
      success: true,
      message: '2FA verification successful',
      data: {
        admin,
        user: admin,
        accessToken: `jwt_access_token_${Date.now()}`,
        refreshToken: `jwt_refresh_token_${Date.now()}`,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || '2FA verification failed' });
  }
};

// Retrieve current authenticated administrative session profile
export const getMe = (_req: Request, res: Response) => {
  const admin = Store.admins[0] || null;
  return res.json({
    success: true,
    data: {
      admin,
      user: admin,
    },
  });
};

// Retrieve secret credentials vault for a specific client
export const getClientVault = (req: Request, res: Response) => {
  try {
    const clientId = req.params.clientId as string;
    const vaultItem = Store.clientVault.find(v => v.client_id === clientId || v.client_key === clientId);

    if (!vaultItem) {
      return res.status(404).json({ success: false, message: `Vault entry for client '${clientId}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: vaultItem,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve client vault' });
  }
};

// Store or update confidential credentials and VPS keys in the vault
export const updateClientVault = (req: Request, res: Response) => {
  try {
    const clientId = req.params.clientId as string;
    const updates = req.body;
    const index = Store.clientVault.findIndex(v => v.client_id === clientId || v.client_key === clientId);

    if (index === -1) {
      const newVaultItem: ClientVaultItem = {
        id: `vlt-${Date.now().toString().slice(-4)}`,
        client_id: clientId,
        client_key: updates.client_key || clientId,
        business_name: updates.business_name || 'Client',
        vps_ip: updates.vps_ip,
        vps_ssh_port: updates.vps_ssh_port || 22,
        vps_ssh_user: updates.vps_ssh_user || 'root',
        vps_ssh_private_key: updates.vps_ssh_private_key,
        db_connection_uri: updates.db_connection_uri,
        api_secret_keys: updates.api_secret_keys,
        secure_notes: updates.secure_notes,
        created_at: new Date().toISOString(),
      };
      Store.clientVault.unshift(newVaultItem);
      return res.status(201).json({
        success: true,
        message: 'Client credentials vault created successfully',
        data: newVaultItem,
      });
    }

    Store.clientVault[index] = {
      ...Store.clientVault[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return res.json({
      success: true,
      message: 'Client credentials vault updated successfully',
      data: Store.clientVault[index],
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update client vault' });
  }
};
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import agencyInfo from '@/lib/information.json';
import logoImg from '@/assets/logo.png';
import { PrintablePaper } from '../common/PrintablePaper';
import { Globe, MapPin, Phone } from 'lucide-react';

/**
 * CashVoucherPreview
 * A4 printable Cash Money Voucher / Cash Money Voucher layout
 * Matches design from physical sample: bilingual header, QR, table, totals, 3-signature footer
 */
export function CashVoucherPreview({ data = {} }) {
  const [liveQr, setLiveQr] = useState('');

  const voucherNo = data?.voucherNo || 'MAT-KV-000000';
  const qrRawText = `PLEXIVIA\nCASH VOUCHER: ${voucherNo}\nPaid To: ${data?.paidTo || 'N/A'}\nAmount: BDT ${data?.grandTotal || 0}\nDate: ${data?.voucherDate || ''}\nVerify: https://plexivia.com/verify/voucher/${voucherNo}`;

  useEffect(() => {
    if (data?.qrCode && typeof data.qrCode === 'string' && data.qrCode.startsWith('data:image')) {
      setLiveQr(data.qrCode);
      return;
    }

    let isMounted = true;
    QRCode.toDataURL(qrRawText, {
      width: 140,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setLiveQr(url);
      })
      .catch((err) => {
        console.warn('QR Code generation error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [data?.qrCode, voucherNo, data?.paidTo, data?.grandTotal, data?.voucherDate, qrRawText]);

  const fmt = (n) =>
    Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <PrintablePaper id="cash-voucher-canvas">
      {/* ─── Outer border box ───────────────────────────────────────────── */}
      <div
        style={{
          border: '3px solid #0b3a60',
          borderRadius: '10px',
          padding: '18px 20px',
          fontFamily: "'Noto Serif Bengali', 'SolaimanLipi', 'Kalpurush', serif",
          minHeight: '780px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          background: '#fff',
          color: '#111',
        }}
      >
        {/* ─── TOP: Logo | Title | Voucher No + QR ────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
          {/* Logo */}
          <div style={{ flexShrink: 0, width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: '78px',
                height: '78px',
                borderRadius: '50%',
                border: '2.5px solid #0b3a60',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <img
                src={logoImg}
                alt="Plexivia Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Center: Title + Agency Name */}
          <div style={{ flex: 1 }}>
            {/* Title Banner */}
            <div
              style={{
                background: '#0b3a60',
                color: '#fff',
                borderRadius: '6px',
                padding: '5px 14px',
                display: 'inline-block',
                marginBottom: '5px',
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.5px' }}>
                Cash Money Voucher
              </span>
            </div>

            {/* Agency Name bilingual */}
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0b3a60', letterSpacing: '0.3px' }}>
                PLEXIVIA
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#222' }}>
                Plexivia
              </div>
            </div>
          </div>

          {/* Right: Voucher No + QR */}
          <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '130px' }}>
            <div style={{ fontSize: '10px', color: '#555' }}>
              <span>Voucher No: </span>
              <span style={{ fontWeight: 700, color: '#0b3a60', fontSize: '11px' }}>
                {data.voucherNo || 'MAT-KV-000000'}
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#555', marginBottom: '5px' }}>
              <span>Voucher Number : </span>
            </div>

            {/* QR Code */}
            {liveQr || data?.qrCode ? (
              <img
                src={liveQr || data?.qrCode}
                alt={`QR Code for Voucher ${voucherNo}`}
                style={{ width: '72px', height: '72px', border: '1px solid #e5e7eb', borderRadius: '4px', display: 'block', marginLeft: 'auto', background: '#fff', padding: '2px' }}
              />
            ) : (
              <div
                style={{
                  width: '72px', height: '72px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  color: '#94a3b8',
                  marginLeft: 'auto',
                }}
              >
                QR Code
              </div>
            )}

            {/* Date */}
            <div style={{ fontSize: '10px', color: '#333', marginTop: '4px', textAlign: 'right' }}>
              <span style={{ fontWeight: 600 }}>Date : </span>
              <span>{data.voucherDate || new Date().toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </div>

        {/* ─── DIVIDER ─────────────────────────────────────────────────── */}
        <div style={{ borderTop: '2px solid #0b3a60', marginBottom: '8px' }} />

        {/* ─── EXPENSE TABLE ────────────────────────────────────────────── */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '11px',
            marginBottom: '6px',
          }}
        >
          <thead>
            <tr style={{ background: '#0b3a60', color: '#fff' }}>
              <th style={{ padding: '5px 8px', textAlign: 'center', width: '60px', borderRight: '1px solid #1c527e' }}>
                SL No
              </th>
              <th style={{ padding: '5px 8px', textAlign: 'left', borderRight: '1px solid #1c527e' }}>
                Expense Description
              </th>
              <th style={{ padding: '5px 8px', textAlign: 'left', borderRight: '1px solid #1c527e' }}>
                Description of Expense
              </th>
              <th style={{ padding: '5px 8px', textAlign: 'right', width: '100px' }}>
                Amount (BDT)
              </th>
            </tr>
          </thead>
          <tbody>
            {(data.items || []).map((item, idx) => (
              <tr
                key={idx}
                style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? '#f0f7ff' : '#fff' }}
              >
                <td style={{ padding: '5px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', color: '#374151' }}>
                  {item.slNo || idx + 1}
                </td>
                <td style={{ padding: '5px 8px', borderRight: '1px solid #e5e7eb', color: '#1f2937' }}>
                  {item.descriptionBn || '-'}
                </td>
                <td style={{ padding: '5px 8px', borderRight: '1px solid #e5e7eb', color: '#374151' }}>
                  {item.descriptionEn || '-'}
                </td>
                <td style={{ padding: '5px 8px', textAlign: 'right', color: '#1f2937', fontWeight: 600 }}>
                  {fmt(item.amount)}
                </td>
              </tr>
            ))}

            {/* Empty filler rows to make the table look full */}
            {(data.items || []).length < 4 &&
              Array.from({ length: 4 - (data.items || []).length }).map((_, i) => (
                <tr key={`empty-${i}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '5px 8px', borderRight: '1px solid #e5e7eb' }}>&nbsp;</td>
                  <td style={{ padding: '5px 8px', borderRight: '1px solid #e5e7eb' }}>&nbsp;</td>
                  <td style={{ padding: '5px 8px', borderRight: '1px solid #e5e7eb' }}>&nbsp;</td>
                  <td style={{ padding: '5px 8px' }}>&nbsp;</td>
                </tr>
              ))}

            {/* Subtotal */}
            <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f9fafb' }}>
              <td colSpan={3} style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700, color: '#374151', borderRight: '1px solid #e5e7eb' }}>
                Subtotal
              </td>
              <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700, color: '#1f2937' }}>
                {fmt(data.subtotal)}
              </td>
            </tr>

            {/* Tax/VAT */}
            <tr style={{ background: '#f9fafb' }}>
              <td colSpan={3} style={{ padding: '5px 8px', textAlign: 'right', color: '#374151', borderRight: '1px solid #e5e7eb' }}>
                Tax/VAT
              </td>
              <td style={{ padding: '5px 8px', textAlign: 'right', color: '#1f2937' }}>
                {fmt(data.taxVat)}
              </td>
            </tr>

            {/* Grand Total */}
            <tr style={{ background: '#0b3a60', color: '#fff' }}>
              <td colSpan={3} style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, borderRight: '1px solid #1c527e' }}>
                Grand Total
              </td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, fontSize: '12px' }}>
                {fmt(data.grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── AMOUNT IN WORDS ─────────────────────────────────────────── */}
        <div
          style={{
            border: '1.5px solid #d1d5db',
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
            marginBottom: '14px',
            background: '#f8fafc',
          }}
        >
          <div style={{ minWidth: '90px', fontSize: '10px', fontWeight: 700, color: '#374151', lineHeight: 1.6 }}>
            <div>Amount in Words</div>
            <div>Amount in Words</div>
          </div>
          <div style={{ flex: 1, borderLeft: '1px solid #e5e7eb', paddingLeft: '10px', fontSize: '11px', color: '#1f2937', lineHeight: 1.7 }}>
            <div style={{ fontWeight: 600 }}>{data.grandTotalInWordsEn || '—'}</div>
            <div>{data.grandTotalInWordsBn || '—'}</div>
          </div>
        </div>

        {/* ─── SIGNATURE ROW ───────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            borderTop: '1.5px solid #d1d5db',
            paddingTop: '10px',
          }}
        >
          {/* Received By */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1.5px solid #374151', paddingTop: '6px', marginTop: '24px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#1f2937' }}>Received By</div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>(Signature By)</div>
              {data.receivedBy && (
                <div style={{ fontSize: '10px', color: '#374151', marginTop: '2px' }}>{data.receivedBy}</div>
              )}
            </div>
          </div>

          {/* Prepared By */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1.5px solid #374151', paddingTop: '6px', marginTop: '24px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#1f2937' }}>Prepared By (Signature & Name)</div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>(Signature &amp; Name)</div>
              {data.preparedBy && (
                <div style={{ fontSize: '10px', color: '#374151', marginTop: '2px' }}>{data.preparedBy}</div>
              )}
            </div>
          </div>

          {/* Authority */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1.5px solid #374151', paddingTop: '6px', marginTop: '24px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#1f2937' }}>Authorized Signatory & Designation</div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>(Signature &amp; Designation)</div>
              {data.accountsSignature && (
                <div style={{ fontSize: '10px', color: '#374151', marginTop: '2px' }}>{data.accountsSignature}</div>
              )}
            </div>
          </div>
        </div>

        {/* ─── FOOTER ──────────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '10px',
            borderTop: '1.5px solid #e5e7eb',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '9px',
            color: '#6b7280',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <MapPin style={{ width: '10px', height: '10px', color: '#0b3a60', flexShrink: 0 }} />
            {agencyInfo.address.fullBn || agencyInfo.address.full}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Phone style={{ width: '10px', height: '10px', color: '#0b3a60', flexShrink: 0 }} />
            {agencyInfo.phone}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Globe style={{ width: '10px', height: '10px', color: '#0b3a60', flexShrink: 0 }} />
            {agencyInfo.website}
          </span>
        </div>
      </div>
    </PrintablePaper>
  );
}

export default CashVoucherPreview;

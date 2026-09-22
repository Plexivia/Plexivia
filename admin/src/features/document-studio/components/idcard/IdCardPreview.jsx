import React from 'react';
import { User, MapPin, Phone, Mail, Globe, Plane, ShieldCheck, Award, Calendar, Droplets } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { formatToDdMmYyyy } from '@/lib/utils';

export function IdCardPreview({ cardData, frontRef, backRef }) {
  // Generate QR code URL
  const qrUrl = cardData.qrData || `https://www.plexivia.com/verify?id=${cardData.idNumber || '123'}`;
  const qrSvg = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl)}`;

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center gap-10 py-4 select-none">
      
      {/* ================= FRONT SIDE CARD ================= */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            📇 Front Side
          </span>
        </div>

        <div
          ref={frontRef}
          id="id-card-front-canvas"
          className="w-[340px] h-[550px] bg-white text-slate-900 rounded-[24px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col justify-between relative font-sans shrink-0"
          style={{ fontFamily: "'Montserrat', 'Plus Jakarta Sans', sans-serif" }}
        >
          {/* Background SVG Decorative Curves (Exact match to reference photo) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 340 550" fill="none">
            {/* Left Side Navy Wave */}
            <path
              d="M0,210 C45,240 45,310 0,350 Z"
              fill="#0b2341"
            />
            {/* Right Side Orange Wave (Top) */}
            <path
              d="M340,195 C295,225 300,285 340,305 Z"
              fill="#ef6c00"
            />
            {/* Right Side Navy Wave (Bottom) */}
            <path
              d="M340,225 C275,265 275,335 340,370 Z"
              fill="#0b2341"
            />
            {/* Bottom Dark Navy Wave Footer */}
            <path
              d="M0,502 C80,488 260,515 340,498 L340,550 L0,550 Z"
              fill="#0b2341"
            />
          </svg>

          {/* Top Lanyard Slot Punch Hole */}
          <div className="w-14 h-3 rounded-full bg-slate-100 border border-slate-300 shadow-inner mx-auto mt-2.5 shrink-0 z-10 flex items-center justify-center">
            <div className="w-10 h-1.5 rounded-full bg-slate-200/80" />
          </div>

          {/* Header Brand Section */}
          <div className="px-4 pt-1 text-center shrink-0 z-10 flex flex-col items-center">
            {/* Logo Emblem */}
            <div className="w-[62px] h-[62px] rounded-full bg-white flex items-center justify-center p-0.5 shadow-md border-[2.5px] border-[#0b2341] relative overflow-hidden shrink-0 mb-1">
              <img src={logoImg} alt="Plexivia Logo" className="w-full h-full object-contain" />
            </div>

            {/* Brand Titles */}
            <h1 className="text-[17px] font-[900] tracking-[0.3px] text-[#0b2341] uppercase leading-none mt-0.5">
              PLEXIVIA
            </h1>
            
            <div className="text-[10px] font-[800] tracking-[1.2px] text-[#0088ba] uppercase flex items-center justify-center gap-1.5 mt-1">
              <span className="w-6 h-[2px] bg-[#ee6c00] rounded-full inline-block" />
              <span>TOURS & TRAVELS</span>
              <span className="w-6 h-[2px] bg-[#ee6c00] rounded-full inline-block" />
            </div>
          </div>

          {/* Photo & Holder Name Badge */}
          <div className="px-4 text-center flex flex-col items-center z-10 mt-1">
            {/* Photo Box */}
            <div className="w-[132px] h-[148px] rounded-[18px] border-[3.5px] border-[#0b2341] shadow-md overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 relative">
              {cardData.photo ? (
                <img src={cardData.photo} alt={cardData.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-slate-400" />
              )}
            </div>

            {/* Holder Name Badge Banner */}
            <div className="w-[245px] bg-[#0b2341] text-white py-1.5 px-3 rounded-xl shadow-md mt-2 flex items-center justify-center">
              <h2 className="text-[12.5px] font-[900] tracking-[0.5px] uppercase truncate text-center">
                {cardData.fullName || 'MD HAKIMUL ISLAM'}
              </h2>
            </div>

            {/* Sub-header / Role Badge */}
            <div className="flex items-center justify-center gap-2 w-full mt-1.5">
              <span className="h-[1px] bg-slate-300 flex-1 max-w-[50px]" />
              <span className="text-[10px] font-[800] tracking-[2px] text-[#0088ba] uppercase">
                {cardData.role || 'EMPLOYEE'}
              </span>
              <span className="h-[1px] bg-slate-300 flex-1 max-w-[50px]" />
            </div>
          </div>

          {/* Details Table */}
          <div className="px-8 text-[11px] text-slate-800 space-y-1.5 z-10 mb-1 font-semibold">
            {/* Employee ID */}
            <div className="flex items-center text-[10.5px]">
              <span className="w-32 text-slate-700 font-bold flex items-center gap-2">
                <span className="w-4 text-[#0b2341] flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                Employee ID
              </span>
              <span className="font-extrabold text-[#0b2341] text-[11px] mr-2">:</span>
              <span className="font-extrabold text-slate-900 text-[11.5px]">
                {cardData.idNumber || '123'}
              </span>
            </div>

            {/* Joining Date */}
            <div className="flex items-center text-[10.5px]">
              <span className="w-32 text-slate-700 font-bold flex items-center gap-2">
                <span className="w-4 text-[#0b2341] flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </span>
                Joining Date
              </span>
              <span className="font-extrabold text-[#0b2341] text-[11px] mr-2">:</span>
              <span className="font-bold text-slate-900 text-[11px]">
                {formatToDdMmYyyy(cardData.joiningDate) || '01-10-2025'}
              </span>
            </div>

            {/* Blood Group */}
            <div className="flex items-center text-[10.5px]">
              <span className="w-32 text-slate-700 font-bold flex items-center gap-2">
                <span className="w-4 text-[#e64a19] flex items-center justify-center">
                  <Droplets className="w-3.5 h-3.5 fill-[#e64a19]" />
                </span>
                Blood Group
              </span>
              <span className="font-extrabold text-[#0b2341] text-[11px] mr-2">:</span>
              <span className="font-extrabold text-[#e64a19] text-[11.5px]">
                {cardData.bloodGroup || 'B+'}
              </span>
            </div>

            {/* Contact Number */}
            <div className="flex items-center text-[10.5px]">
              <span className="w-32 text-slate-700 font-bold flex items-center gap-2">
                <span className="w-4 text-[#0b2341] flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                Contact Number
              </span>
              <span className="font-extrabold text-[#0b2341] text-[11px] mr-2">:</span>
              <span className="font-bold text-slate-900 text-[11px]">
                {cardData.contactPhone || '01345579534'}
              </span>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="text-white text-center py-2 px-4 text-[13px] z-10 flex items-center justify-center gap-2 shrink-0">
            <span style={{ fontFamily: "'Alex Brush', cursive" }} className="text-white text-base tracking-wide leading-none pt-0.5">
              Your Trusted Travel Partner
            </span>
            <Plane className="w-4 h-4 text-sky-400 rotate-45 shrink-0" fill="currentColor" />
          </div>
        </div>
      </div>


      {/* ================= BACK SIDE CARD ================= */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            💳 Back Side
          </span>
        </div>

        <div
          ref={backRef}
          id="id-card-back-canvas"
          className="w-[340px] h-[550px] bg-white text-slate-900 rounded-[24px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col justify-between relative font-sans shrink-0"
          style={{ fontFamily: "'Montserrat', 'Plus Jakarta Sans', sans-serif" }}
        >
          {/* Top Header Background SVG Waves */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 340 550" fill="none">
            {/* Main Header Blue Section */}
            <path
              d="M0,0 L340,0 L340,85 C240,110 100,75 0,95 Z"
              fill="#0b2341"
            />
            {/* Orange Wave Line Accent */}
            <path
              d="M0,95 C100,75 240,110 340,85 L340,92 C240,117 100,82 0,102 Z"
              fill="#ef6c00"
            />
            {/* Bottom Dark Navy Footer Curve */}
            <path
              d="M0,515 C120,495 230,525 340,510 L340,550 L0,550 Z"
              fill="#0b2341"
            />
          </svg>

          {/* Top Lanyard Slot Hole */}
          <div className="w-14 h-3 rounded-full bg-slate-100/30 border border-white/20 shadow-inner mx-auto mt-2.5 shrink-0 z-10 flex items-center justify-center">
            <div className="w-10 h-1.5 rounded-full bg-white/20" />
          </div>

          {/* Top Header Content */}
          <div className="px-5 pt-0 pb-3 text-white z-10 shrink-0 flex items-center gap-3">
            {/* Left Small Logo */}
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-0.5 border border-slate-200 shadow-sm shrink-0 overflow-hidden">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>

            {/* Right Brand Text */}
            <div>
              <h2 className="text-sm font-[900] tracking-[0.5px] uppercase leading-none text-white">
                PLEXIVIA
              </h2>
              <div className="text-[9px] font-[800] tracking-[1px] text-[#0088ba] uppercase flex items-center gap-1 mt-0.5">
                <span className="w-3 h-[1.5px] bg-[#ee6c00] rounded-full inline-block" />
                <span className="text-white">TOURS & TRAVELS</span>
                <span className="w-3 h-[1.5px] bg-[#ee6c00] rounded-full inline-block" />
              </div>
              <p className="text-[9px] text-sky-200 italic font-medium mt-0.5 leading-none">
                Your Trusted Travel Partner
              </p>
            </div>
          </div>

          {/* Contact Details List (3 Rows) */}
          <div className="px-6 py-1 space-y-2.5 z-10 text-[10.5px]">
            {/* Address */}
            <div className="flex items-start gap-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0b2341] text-white flex items-center justify-center shrink-0 shadow-sm">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#0b2341] text-[11px] leading-tight">Address</h4>
                <p className="text-slate-700 text-[10px] font-medium leading-snug mt-0.5">
                  {cardData.address || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}
                </p>
              </div>
            </div>

            {/* Contact Number */}
            <div className="flex items-start gap-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0b2341] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#0b2341] text-[11px] leading-tight">Contact Number</h4>
                <p className="text-slate-800 text-[10.5px] font-bold font-mono mt-0.5">
                  {cardData.contactPhone || '01345579534'}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0b2341] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#0b2341] text-[11px] leading-tight">Email</h4>
                <p className="text-slate-800 text-[10px] font-bold mt-0.5">
                  {cardData.email || 'support@plexivia.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="px-6 py-1 z-10">
            <h4 className="font-[800] text-[#0088ba] uppercase tracking-[0.5px] text-[10.5px] mb-1">
              TERMS & CONDITIONS
            </h4>
            <ul className="space-y-0.5 text-[9.5px] text-slate-800 font-medium leading-tight pl-0">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-900 font-black text-xs leading-none">•</span>
                <span>This ID card is the property of Plexivia.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-900 font-black text-xs leading-none">•</span>
                <span>This card is non-transferable.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-900 font-black text-xs leading-none">•</span>
                <span>This card must be worn at all times during working hours.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-900 font-black text-xs leading-none">•</span>
                <span>If found, please return to the address or contact number above.</span>
              </li>
            </ul>
          </div>

          {/* Signature & QR Code Block */}
          <div className="px-6 py-2 flex items-end justify-between z-10">
            {/* Signature Block */}
            <div className="text-center">
              <div 
                style={{ fontFamily: "'Alex Brush', cursive" }} 
                className="text-2xl font-bold text-[#0b2341] leading-none mb-1 text-center"
              >
                {cardData.signatureName || 'M. Ali'}
              </div>
              <div className="border-b border-[#0b2341] w-32 mx-auto mb-1" />
              <div className="text-[9px] font-extrabold text-[#0b2341] uppercase tracking-tight leading-tight">
                Authorized Signature
              </div>
              <div className="text-[8.5px] font-semibold text-slate-600 leading-tight">
                {cardData.signatureTitle || 'Managing Director'}
              </div>
            </div>

            {/* QR Code Container */}
            <div className="w-[72px] h-[72px] border-[2px] border-[#0b2341] rounded-xl p-1 bg-white shrink-0 shadow-sm flex items-center justify-center">
              <img src={qrSvg} alt="QR Code" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Footer Bar */}
          <div className="text-white text-center py-1.5 px-4 text-[10px] z-10 flex items-center justify-center gap-1.5 shrink-0">
            <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="font-bold tracking-wide">
              {cardData.website || 'www.plexivia.com'}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}

/**
 * Canonical 5 Case Processing Stages across Plexivia ERP.
 * 
 * Defined per user specification:
 * 1. Intake         -> Solid Orange (Text White)
 * 2. Under Process  -> Solid Purple (Text White)
 * 3. Offer Letter   -> Solid Blue   (Text White)
 * 4. Visa Delivered -> Solid Green  (Text White)
 * 5. Cancelled      -> Solid Red    (Text White)
 */

export const CASE_PIPELINE_STAGES = [
  {
    id: 'INTAKE',
    title: 'Intake',
    stepNumber: 1,
    colorName: 'Orange',
    bgColor: 'bg-orange-500',
    solidClass: 'bg-orange-500 hover:bg-orange-600 text-white font-bold border-orange-600 shadow-sm',
    badgeClass: 'bg-orange-500 text-white font-bold border-orange-600 shadow-2xs',
    textClass: 'text-orange-600',
    borderClass: 'border-orange-600',
    accentColor: '#f97316',
  },
  {
    id: 'UNDER_PROCESS',
    title: 'Under Process',
    stepNumber: 2,
    colorName: 'Purple',
    bgColor: 'bg-purple-600',
    solidClass: 'bg-purple-600 hover:bg-purple-700 text-white font-bold border-purple-700 shadow-sm',
    badgeClass: 'bg-purple-600 text-white font-bold border-purple-700 shadow-2xs',
    textClass: 'text-purple-600',
    borderClass: 'border-purple-700',
    accentColor: '#9333ea',
  },
  {
    id: 'OFFER_LETTER',
    title: 'Offer Letter',
    stepNumber: 3,
    colorName: 'Blue',
    bgColor: 'bg-blue-600',
    solidClass: 'bg-blue-600 hover:bg-blue-700 text-white font-bold border-blue-700 shadow-sm',
    badgeClass: 'bg-blue-600 text-white font-bold border-blue-700 shadow-2xs',
    textClass: 'text-blue-600',
    borderClass: 'border-blue-700',
    accentColor: '#2563eb',
  },
  {
    id: 'VISA_DELIVERED',
    title: 'Visa Delivered',
    stepNumber: 4,
    colorName: 'Green',
    bgColor: 'bg-emerald-600',
    solidClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-emerald-700 shadow-sm',
    badgeClass: 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-2xs',
    textClass: 'text-emerald-600',
    borderClass: 'border-emerald-700',
    accentColor: '#059669',
  },
  {
    id: 'CANCELLED',
    title: 'Cancelled',
    stepNumber: 5,
    colorName: 'Red',
    bgColor: 'bg-red-600',
    solidClass: 'bg-red-600 hover:bg-red-700 text-white font-bold border-red-700 shadow-sm',
    badgeClass: 'bg-red-600 text-white font-bold border-red-700 shadow-2xs',
    textClass: 'text-red-600',
    borderClass: 'border-red-700',
    accentColor: '#dc2626',
  },
];

/**
 * Normalizes any legacy or database status into one of the 5 canonical IDs:
 * 'INTAKE' | 'UNDER_PROCESS' | 'OFFER_LETTER' | 'VISA_DELIVERED' | 'CANCELLED'
 */
export const getCanonicalStage = (status) => {
  const raw = String(status || 'INTAKE').trim().toUpperCase();

  if (raw === 'INTAKE' || raw === 'ENTRY' || raw === 'NEW' || raw.includes('INTAKE')) {
    return 'INTAKE';
  }
  if (
    raw === 'UNDER_PROCESS' ||
    raw === 'PROCESSING' ||
    raw === 'IN_PROGRESS' ||
    raw === 'SUBMITTED_EMBASSY_BSF' ||
    raw.includes('PROCESS') ||
    raw.includes('EMBASSY')
  ) {
    return 'UNDER_PROCESS';
  }
  if (
    raw === 'OFFER_LETTER' ||
    raw === 'APPROVED_OFFER_LETTER' ||
    raw === 'FLIGHT_BOOKED' ||
    raw.includes('OFFER')
  ) {
    return 'OFFER_LETTER';
  }
  if (
    raw === 'VISA_DELIVERED' ||
    raw === 'COMPLETED' ||
    raw === 'COMPLETED_DELIVERED' ||
    raw === 'DELIVERED' ||
    raw === 'STAMPED' ||
    raw === 'VISA_STAMPED' ||
    raw.includes('DELIVER')
  ) {
    return 'VISA_DELIVERED';
  }
  if (
    raw === 'CANCELLED' ||
    raw === 'CANCELED' ||
    raw === 'REJECTED' ||
    raw === 'FAILED' ||
    raw === 'ON_HOLD' ||
    raw.includes('CANCEL') ||
    raw.includes('REJECT')
  ) {
    return 'CANCELLED';
  }

  return 'INTAKE';
};

/**
 * Resolves the stage configuration object for any given status
 */
export const getStageConfig = (status) => {
  const canonId = getCanonicalStage(status);
  return CASE_PIPELINE_STAGES.find((s) => s.id === canonId) || CASE_PIPELINE_STAGES[0];
};

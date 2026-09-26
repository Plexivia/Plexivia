const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

// Convert numeric pattern to bar and space widths
const patternToBars = (pattern: string): number[] => {
  return pattern.split('').map(Number);
};

// Encode ASCII string into Code 128 Type B bar patterns with checksum
export const encodeCode128B = (text: string): number[] => {
  const cleanText = text.replace(/[^\x20-\x7E]/g, '');
  const startCode = 104;
  let checksum = startCode;
  const bars: number[] = [...patternToBars(CODE128_PATTERNS[startCode])];

  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i) - 32;
    checksum += charCode * (i + 1);
    bars.push(...patternToBars(CODE128_PATTERNS[charCode]));
  }

  const checkDigit = checksum % 103;
  bars.push(...patternToBars(CODE128_PATTERNS[checkDigit]));
  bars.push(...patternToBars(CODE128_PATTERNS[106]));

  return bars;
};

// Generate custom branded Plexivia Barcode SVG markup
export const generatePlexiviaBarcodeSvg = (
  text: string,
  options: { width?: number; height?: number; includeText?: boolean; brandHeader?: boolean } = {}
): string => {
  const normalizedText = text.startsWith('PLX-') ? text : `PLX-${text}`;
  const width = options.width || 320;
  const height = options.height || 75;
  const includeText = options.includeText !== false;
  const brandHeader = options.brandHeader !== false;

  const barUnits = encodeCode128B(normalizedText);
  const totalUnits = barUnits.reduce((a, b) => a + b, 0);
  const unitWidth = width / (totalUnits + 16);
  const barHeight = height - (includeText ? 24 : 8) - (brandHeader ? 14 : 0);
  const startY = brandHeader ? 14 : 4;

  let currentX = unitWidth * 8;
  let rects = '';

  for (let i = 0; i < barUnits.length; i++) {
    const w = barUnits[i] * unitWidth;
    if (i % 2 === 0) {
      rects += `<rect x="${currentX.toFixed(2)}" y="${startY}" width="${w.toFixed(2)}" height="${barHeight}" fill="#0B3A60" />`;
    }
    currentX += w;
  }

  let headerSvg = '';
  if (brandHeader) {
    headerSvg = `<text x="${(width / 2).toFixed(2)}" y="10" text-anchor="middle" font-family="monospace, sans-serif" font-size="8.5" font-weight="bold" fill="#0D47A1" letter-spacing="1.5">PLEXIVIA SECURITY ID</text>`;
  }

  let textSvg = '';
  if (includeText) {
    textSvg = `<text x="${(width / 2).toFixed(2)}" y="${(height - 4).toFixed(2)}" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#1E293B" letter-spacing="2">★ ${normalizedText} ★</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: transparent;">
    ${headerSvg}
    ${rects}
    ${textSvg}
  </svg>`;
};

// Generate base64 Data URI for generated barcode
export const generatePlexiviaBarcodeDataUrl = (text: string, options?: any): string => {
  const svg = generatePlexiviaBarcodeSvg(text, options);
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

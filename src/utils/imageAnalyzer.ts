export const analyzeImageForEmptySpace = (file: File): Promise<{ logoPos: {x:number, y:number}, numberPos: {x:number, y:number} }> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve({ logoPos: {x: 10, y: 10}, numberPos: {x: 50, y: 88} });
        return;
      }
      
      // Scale down to a micro-canvas for near-instant processing
      const scale = Math.min(1, 120 / img.width);
      canvas.width = Math.max(1, Math.floor(img.width * scale));
      canvas.height = Math.max(1, Math.floor(img.height * scale));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        // Fast variance calculation using sampled pixel stride
        const getVariance = (xPct: number, yPct: number, wPct: number, hPct: number) => {
          const startX = Math.floor(canvas.width * (xPct/100));
          const startY = Math.floor(canvas.height * (yPct/100));
          const endX = Math.floor(canvas.width * ((xPct+wPct)/100));
          const endY = Math.floor(canvas.height * ((yPct+hPct)/100));
          
          let sumR = 0, sumG = 0, sumB = 0;
          let count = 0;
          
          for (let y = startY; y < endY; y += 2) {
            for (let x = startX; x < endX; x += 2) {
               const i = (y * canvas.width + x) * 4;
               sumR += data[i];
               sumG += data[i+1];
               sumB += data[i+2];
               count++;
            }
          }
          
          if (count === 0) return Infinity;
          
          const avgR = sumR / count;
          const avgG = sumG / count;
          const avgB = sumB / count;
          
          let variance = 0;
          for (let y = startY; y < endY; y += 2) {
            for (let x = startX; x < endX; x += 2) {
               const i = (y * canvas.width + x) * 4;
               variance += Math.abs(data[i] - avgR) + Math.abs(data[i+1] - avgG) + Math.abs(data[i+2] - avgB);
            }
          }
          return variance / count;
        };

        // Define candidate spots for number box (mostly bottom area)
        const numCandidates = [
          { pos: {x: 50, y: 88}, region: {x: 35, y: 80, w: 30, h: 15} }, // Bottom Center
          { pos: {x: 85, y: 88}, region: {x: 70, y: 80, w: 30, h: 15} }, // Bottom Right
          { pos: {x: 15, y: 88}, region: {x: 0,  y: 80, w: 30, h: 15} }, // Bottom Left
          { pos: {x: 50, y: 12}, region: {x: 35, y: 5,  w: 30, h: 15} }, // Top Center (fallback)
        ];

        let bestNum = numCandidates[0].pos;
        let minNumVar = Infinity;
        for (const c of numCandidates) {
          const v = getVariance(c.region.x, c.region.y, c.region.w, c.region.h);
          if (v < minNumVar) {
            minNumVar = v;
            bestNum = c.pos;
          }
        }

        URL.revokeObjectURL(url);
        resolve({ logoPos: {x: 10, y: 10}, numberPos: bestNum });
      } catch {
        URL.revokeObjectURL(url);
        resolve({ logoPos: {x: 10, y: 10}, numberPos: {x: 50, y: 88} });
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ logoPos: {x: 10, y: 10}, numberPos: {x: 50, y: 88} });
    };
    
    img.src = url;
  });
};

export interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  luminance: number;
  contrastText: string;
}

export interface DynamicBadgeTemplate {
  id: string;
  name: string;
  desc: string;
  badgeStyle: 'solid' | 'transparent' | 'outline';
  bg: string;
  text: string;
  outlineThickness?: number;
}

export interface ImagePaletteResult {
  dominant: ExtractedColor;
  vibrant: ExtractedColor;
  dark: ExtractedColor;
  light: ExtractedColor;
  swatches: ExtractedColor[];
  templates: DynamicBadgeTemplate[];
}

export const extractImagePalette = (source: File | string): Promise<ImagePaletteResult> => {
  return new Promise((resolve) => {
    const isFile = typeof source !== 'string';
    const url = isFile ? URL.createObjectURL(source) : source;
    const img = new Image();

    const cleanup = () => {
      if (isFile) URL.revokeObjectURL(url);
    };

    const fallback: ImagePaletteResult = {
      dominant: { hex: '#B45309', rgb: { r: 180, g: 83, b: 9 }, luminance: 88, contrastText: '#FFFFFF' },
      vibrant: { hex: '#0071E3', rgb: { r: 0, g: 113, b: 227 }, luminance: 95, contrastText: '#FFFFFF' },
      dark: { hex: '#18181B', rgb: { r: 24, g: 24, b: 27 }, luminance: 24, contrastText: '#FFFFFF' },
      light: { hex: '#F3F4F6', rgb: { r: 243, g: 244, b: 246 }, luminance: 243, contrastText: '#111827' },
      swatches: [
        { hex: '#B45309', rgb: { r: 180, g: 83, b: 9 }, luminance: 88, contrastText: '#FFFFFF' },
        { hex: '#0071E3', rgb: { r: 0, g: 113, b: 227 }, luminance: 95, contrastText: '#FFFFFF' },
        { hex: '#18181B', rgb: { r: 24, g: 24, b: 27 }, luminance: 24, contrastText: '#FFFFFF' },
        { hex: '#FFD700', rgb: { r: 255, g: 215, b: 0 }, luminance: 200, contrastText: '#111827' },
        { hex: '#059669', rgb: { r: 5, g: 150, b: 105 }, luminance: 108, contrastText: '#FFFFFF' },
        { hex: '#DC2626', rgb: { r: 220, g: 38, b: 38 }, luminance: 75, contrastText: '#FFFFFF' },
        { hex: '#7C3AED', rgb: { r: 124, g: 58, b: 237 }, luminance: 78, contrastText: '#FFFFFF' },
        { hex: '#D97706', rgb: { r: 217, g: 119, b: 6 }, luminance: 125, contrastText: '#111827' },
        { hex: '#4B5563', rgb: { r: 75, g: 85, b: 99 }, luminance: 82, contrastText: '#FFFFFF' },
        { hex: '#F3F4F6', rgb: { r: 243, g: 244, b: 246 }, luminance: 243, contrastText: '#111827' },
      ],
      templates: []
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          cleanup();
          resolve(fallback);
          return;
        }

        // Downscale to 100x100 for fast, high-coverage sampling (10,000 pixels)
        const size = 100;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size);
        const data = imgData.data;

        // Redmean color distance helper (accurate perceptual color difference)
        const getRedmeanDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number => {
          const rBar = (r1 + r2) / 2;
          const dr = r1 - r2;
          const dg = g1 - g2;
          const db = b1 - b2;
          return Math.sqrt(
            (2 + rBar / 256) * dr * dr +
            4 * dg * dg +
            (2 + (255 - rBar) / 256) * db * db
          );
        };

        // RGB to HSL helper
        const rgbToHsl = (r: number, g: number, b: number) => {
          const rNorm = r / 255;
          const gNorm = g / 255;
          const bNorm = b / 255;
          const max = Math.max(rNorm, gNorm, bNorm);
          const min = Math.min(rNorm, gNorm, bNorm);
          const d = max - min;
          const l = (max + min) / 2;
          let s = 0;
          if (d !== 0) {
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          }
          let h = 0;
          if (d !== 0) {
            if (max === rNorm) h = ((gNorm - bNorm) / d) % 6;
            else if (max === gNorm) h = (bNorm - rNorm) / d + 2;
            else h = (rNorm - gNorm) / d + 4;
            h = Math.round(h * 60);
            if (h < 0) h += 360;
          }
          return { h, s, l };
        };

        // Quantize pixels into fine buckets (step 20)
        const bucketMap = new Map<string, { count: number; rSum: number; gSum: number; bSum: number }>();

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 128) continue; // Skip transparent

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Skip extreme blown-out white and pure black
          if (r > 252 && g > 252 && b > 252) continue;
          if (r < 8 && g < 8 && b < 8) continue;

          const step = 20;
          const qR = Math.round(r / step) * step;
          const qG = Math.round(g / step) * step;
          const qB = Math.round(b / step) * step;
          const key = `${qR},${qG},${qB}`;

          const existing = bucketMap.get(key);
          if (existing) {
            existing.count++;
            existing.rSum += r;
            existing.gSum += g;
            existing.bSum += b;
          } else {
            bucketMap.set(key, { count: 1, rSum: r, gSum: g, bSum: b });
          }
        }

        if (bucketMap.size === 0) {
          cleanup();
          resolve(fallback);
          return;
        }

        // Convert buckets to candidates and score them
        interface Candidate {
          r: number;
          g: number;
          b: number;
          hex: string;
          count: number;
          sat: number;
          lum: number;
          score: number;
        }

        const candidates: Candidate[] = [];

        bucketMap.forEach((val) => {
          if (val.count < 3) return; // Ignore noise
          const r = Math.round(val.rSum / val.count);
          const g = Math.round(val.gSum / val.count);
          const b = Math.round(val.bSum / val.count);
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const hsl = rgbToHsl(r, g, b);
          const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();

          // Balanced score: Pixel frequency + strong saturation/accent boost
          // Accents (cushions, trims, hardware) get elevated above monotonous wall/floor pixels
          const score = Math.pow(val.count, 0.45) * (1 + hsl.s * 2.8) * (hsl.l > 0.12 && hsl.l < 0.88 ? 1.3 : 0.85);

          candidates.push({ r, g, b, hex, count: val.count, sat: hsl.s, lum, score });
        });

        // Sort candidates by vibrant score descending
        candidates.sort((a, b) => b.score - a.score);

        // Select 10 distinct, non-duplicate colors using Redmean distance
        const selected: { r: number; g: number; b: number; hex: string }[] = [];

        const tryAddCandidate = (cand: { r: number; g: number; b: number; hex: string }, minDistance: number): boolean => {
          if (selected.length >= 10) return false;
          const hexLower = cand.hex.toLowerCase();
          const isDuplicate = selected.some(s => s.hex.toLowerCase() === hexLower);
          if (isDuplicate) return false;

          const isTooClose = selected.some(s => getRedmeanDistance(cand.r, cand.g, cand.b, s.r, s.g, s.b) < minDistance);
          if (!isTooClose) {
            selected.push({ r: cand.r, g: cand.g, b: cand.b, hex: cand.hex });
            return true;
          }
          return false;
        };

        // Pass 1: Strict distance threshold >= 60 for wide variety
        for (const cand of candidates) {
          tryAddCandidate(cand, 60);
          if (selected.length >= 10) break;
        }

        // Pass 2: Moderate distance threshold >= 42 if more colors needed
        if (selected.length < 10) {
          for (const cand of candidates) {
            tryAddCandidate(cand, 42);
            if (selected.length >= 10) break;
          }
        }

        // Pass 3: Fill remaining slots with harmonized furniture design tones if image lacks variety
        if (selected.length < 10) {
          const STUDIO_FURNITURE_ACCENTS = [
            { r: 180, g: 83, b: 9, hex: '#B45309' },   // Amber Wood
            { r: 0, g: 113, b: 227, hex: '#0071E3' },  // Royal Navy
            { r: 24, g: 24, b: 27, hex: '#18181B' },   // Charcoal Black
            { r: 255, g: 215, b: 0, hex: '#FFD700' },  // Gold / Brass
            { r: 5, g: 150, b: 105, hex: '#059669' },  // Emerald Green
            { r: 220, g: 38, b: 38, hex: '#DC2626' },  // Crimson Red
            { r: 124, g: 58, b: 237, hex: '#7C3AED' }, // Royal Violet
            { r: 217, g: 119, b: 6, hex: '#D97706' },  // Warm Teak
            { r: 92, g: 58, b: 33, hex: '#5C3A21' },   // Deep Walnut
            { r: 75, g: 85, b: 99, hex: '#4B5563' },   // Slate Gray
            { r: 243, g: 244, b: 246, hex: '#F3F4F6' },// Clean Neutral
            { r: 15, g: 118, b: 110, hex: '#0F766E' }, // Deep Teal
          ];

          for (const acc of STUDIO_FURNITURE_ACCENTS) {
            tryAddCandidate(acc, 40);
            if (selected.length >= 10) break;
          }
        }

        // Format to ExtractedColor with WCAG relative luminance contrast
        const toExtracted = (c: { r: number; g: number; b: number; hex: string }): ExtractedColor => {
          const lum = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
          const [sR, sG, sB] = [c.r, c.g, c.b].map(v => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          });
          const relLum = 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
          const contrastText = relLum > 0.36 ? '#111827' : '#FFFFFF';
          return {
            hex: c.hex,
            rgb: { r: Math.round(c.r), g: Math.round(c.g), b: Math.round(c.b) },
            luminance: Math.round(lum),
            contrastText
          };
        };

        const swatches = selected.slice(0, 10).map(toExtracted);
        const dominant = swatches[0] || fallback.dominant;
        const vibrant = swatches.slice().sort((a, b) => b.rgb.r - a.rgb.r)[0] || fallback.vibrant;
        const dark = swatches.slice().sort((a, b) => a.luminance - b.luminance)[0] || fallback.dark;
        const light = swatches.slice().sort((a, b) => b.luminance - a.luminance)[0] || fallback.light;

        const templates: DynamicBadgeTemplate[] = swatches.map((sw, idx) => ({
          id: `swatch-${idx}`,
          name: `কালার ${idx + 1}`,
          desc: sw.hex,
          badgeStyle: 'solid',
          bg: sw.hex,
          text: sw.contrastText
        }));

        cleanup();
        resolve({
          dominant,
          vibrant,
          dark,
          light,
          swatches,
          templates
        });
      } catch {
        cleanup();
        resolve(fallback);
      }
    };

    img.onerror = () => {
      cleanup();
      resolve(fallback);
    };

    img.src = url;
  });
};

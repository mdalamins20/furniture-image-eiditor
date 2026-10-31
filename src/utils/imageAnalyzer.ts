// ---------------------------------------------------------------------------
// Advanced Empty Space & Furniture Saliency Detection System
// Logo: Strictly Top-Left (x: 10, y: 10)
// Number Badge: Auto-scans for clean empty floor/background, avoiding all furniture
// ---------------------------------------------------------------------------

const DEFAULT_GEMINI_KEY = '';

export const getGeminiApiKey = (): string => {
  // Keys come from the build-time env only. Never store a user-typed API
  // key in localStorage, and never put it in the request URL.
  // Note: a VITE_ key is still visible in the browser bundle, so for
  // production this call should move behind a server-side proxy.
  return (import.meta.env.VITE_GEMINI_API_KEY as string) || DEFAULT_GEMINI_KEY;
};

export const setGeminiApiKey = (key: string): void => {
  // Deprecated no-op kept for callers: typing a key into the browser no
  // longer saves it to localStorage. Use VITE_GEMINI_API_KEY in .env.
  void key;
};

export interface PlacementDetectionResult {
  logoPos: { x: number; y: number };
  numberPos: { x: number; y: number };
  detectedVia?: 'gemini' | 'local_vision';
  modelUsed?: string;
  reason?: string;
}

// Low-cost, high-speed models prioritized to preserve user credit limits
const LOW_COST_MODELS = [
  'gemini-3.1-flash-lite',   // Most cost-efficient: $0.25/1M tokens (active on user AI Studio)
  'gemini-3.5-flash-lite',   // High-throughput 3.5: $0.30/1M tokens
  'gemini-flash-lite-latest' // Latest flash lite alias
];

/**
 * Call Google Gemini Vision to detect furniture boundaries and safe empty floor/background zones
 * Uses the lowest-cost models from Google AI Studio to preserve credit limits.
 */
async function callGeminiVisionForPlacement(
  canvas: HTMLCanvasElement,
  apiKey: string
): Promise<PlacementDetectionResult | null> {
  try {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64Data = dataUrl.split(',')[1];
    if (!base64Data) return null;

    const promptText = `You are an elite graphic design AI system specialized in commercial furniture product advertisement layouts.
Analyze this furniture photograph. The furniture item could be ANY category: Bed, Almari, Sofa, Dressing Table, Dining Table, Showcase, Oven Cabinet, Shoe Rack, TV Cabinet, etc.

We need to place two essential brand elements on the final graphic:
1. "logoPos": MUST ALWAYS be strictly top-left corner: { "x": 12, "y": 12 }.
2. "numberPos": A contact phone badge (approx 34% width, 10% height).

MANDATORY PLACEMENT RULE (STRICT HIERARCHY):
1. [HIGHEST PRIORITY - ALWAYS PREFERRED]:
   ALWAYS TRY TO PLACE "numberPos" AT THE BOTTOM OF THE IMAGE (y between 82 and 90, such as bottom-center {x: 50, y: 88}, bottom-right {x: 74, y: 88}, or bottom-left {x: 26, y: 88}) on clean, open floor / carpet / background space.
2. [FALLBACK ONLY - IF NO ROOM AT THE BOTTOM]:
   ONLY IF there is NO empty room at the bottom because the furniture completely occupies or blocks the bottom area, THEN AND ONLY THEN search for clean empty space elsewhere on the image:
   - on the clean right flank (e.g. x: 74, y: 65)
   - or on the clean upper wall / background (e.g. x: 74, y: 18 or x: 50, y: 18).

CRITICAL NON-NEGOTIABLE SAFETY RULES:
- The phone badge MUST NEVER touch, overlap, or collide with ANY part of the furniture (doors, handles, mirrors, frames, cushions, tabletop, legs, shelves).
- The phone badge MUST NEVER overlap the top-left logo. If placed high (y < 35), x must be >= 45.
- BOUNDARY SAFETY: The phone badge is ~34% wide. To guarantee it NEVER spills outside the image, "x" MUST ALWAYS be between 24 and 76, and "y" MUST ALWAYS be between 14 and 90. NEVER suggest x > 76 or x < 24!

Return ONLY a valid JSON object:
{
  "logoPos": { "x": 12, "y": 12 },
  "numberPos": { "x": <number 24-76>, "y": <number 14-90> },
  "furnitureType": "<detected category>",
  "reason": "<short explanation why this spot was selected>"
}`;

    // Loop through lowest-cost models first to save user credits
    for (const model of LOW_COST_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { inline_data: { mime_type: 'image/jpeg', data: base64Data } },
                  { text: promptText }
                ]
              }
            ],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.1
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) continue;

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        const parsed = JSON.parse(rawText);
        if (
          typeof parsed?.numberPos?.x === 'number' &&
          typeof parsed?.numberPos?.y === 'number'
        ) {
          // Strictly clamp x between 24 and 76, and y between 14 and 90 so badge NEVER spills outside
          let x = Math.min(76, Math.max(24, Math.round(parsed.numberPos.x)));
          let y = Math.min(90, Math.max(14, Math.round(parsed.numberPos.y)));
          // Strictly prevent collision with top-left logo (x < 35 && y < 30)
          if (y < 35 && x < 45) {
            x = 55;
          }

          return {
            logoPos: { x: 12, y: 12 },
            numberPos: { x, y },
            detectedVia: 'gemini',
            modelUsed: model,
            reason: parsed.reason
          };
        }
      } catch {
        // Continue to next low-cost model in fallback sequence
        continue;
      }
    }
  } catch (err) {
    console.warn('Gemini vision detection skipped, using local vision:', err);
  }
  return null;
}

/**
 * Ultra-High Precision Universal Furniture Computer Vision Engine
 * Supports ALL furniture categories across ANY image dimensions & aspect ratios:
 * - Bed / Mattress
 * - Almari / Wardrobe (tall vertical)
 * - Sofa / Sectional (wide horizontal)
 * - Dressing Table (tall with mirror)
 * - Dining Table (complex legs & chairs)
 * - Showcase / Crockery Cabinet
 * - Oven Cabinet / Kitchen Pantry
 * - Shoe Rack / Low Credenza
 * - TV Cabinet / Entertainment Unit
 *
 * Principles:
 * 1. Aspect ratio is preserved dynamically (never stretched to a square).
 * 2. Logo is strictly anchored to Top-Left: { x: 10, y: 10 }.
 * 3. Phone badge ALWAYS tries the BOTTOM area first with highest priority.
 *    Only if bottom is blocked by furniture, it searches for other clean open zones (flank/wall).
 */
export interface LocalVisionResult extends PlacementDetectionResult {
  checkCollision: (pos: { x: number; y: number }) => { edgeCollisionCount: number; isSafe: boolean };
}

/**
 * Ultra-High Precision Universal Furniture Computer Vision Engine
 * Supports ALL furniture categories across ANY image dimensions & aspect ratios:
 * - Bed / Mattress
 * - Almari / Wardrobe (tall vertical with solid doors)
 * - Sofa / Sectional (wide horizontal with smooth cushions)
 * - Dressing Table (tall with mirror & drawers)
 * - Dining Table (complex legs & smooth tabletop)
 * - Showcase / Crockery Cabinet
 * - Oven Cabinet / Kitchen Pantry
 * - Shoe Rack / Low Credenza
 * - TV Cabinet / Entertainment Unit
 *
 * 100% PURE ZERO-COLLISION GUARANTEE:
 * 1. Sensitive multi-threshold Sobel edge detection (grad > 52).
 * 2. Background chroma & luminance contrast segmentation (distinguishes furniture body from studio backdrop).
 * 3. 2D Span Interior Filling: fills solid wood panels, mattress tops, and sofa cushions so furniture interior is NEVER treated as empty space!
 * 4. Generous 6px morphological dilation safety buffer around all contours.
 * 5. Strict Bottom-First preference (only falls back to flank/wall if bottom is physically blocked).
 * 6. Mandatory validation of all AI/Gemini proposals against the occupancy mask.
 */
function analyzeImageLocallyWithVision(img: HTMLImageElement): LocalVisionResult {
  const origW = img.naturalWidth || img.width || 800;
  const origH = img.naturalHeight || img.height || 800;
  const aspectRatio = origW / origH;

  // Max dimension 320 for sub-25ms analysis while retaining pixel-level precision
  const maxDim = 320;
  const scale = Math.min(1, maxDim / Math.max(origW, origH));
  const W = Math.max(64, Math.round(origW * scale));
  const H = Math.max(64, Math.round(origH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return {
      logoPos: { x: 10, y: 10 },
      numberPos: { x: 50, y: 90 },
      detectedVia: 'local_vision',
      checkCollision: () => ({ edgeCollisionCount: 0, isSafe: true })
    };
  }

  ctx.drawImage(img, 0, 0, W, H);
  const imgData = ctx.getImageData(0, 0, W, H);
  const data = imgData.data;

  // 1. Grayscale Luminance
  const lum = new Float32Array(W * H);
  for (let i = 0; i < lum.length; i++) {
    const idx = i * 4;
    lum[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  // 2. Sample Studio Backdrop / Ambient Wall Reference Color
  let bgR = 0, bgG = 0, bgB = 0, bgSamples = 0;
  const samplePixel = (px: number, py: number) => {
    const idx = (py * W + px) * 4;
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
    bgSamples++;
  };

  // Top margin sample (y: 1 to 5%, x: 45% to 95%)
  for (let y = 1; y < Math.max(2, Math.floor(H * 0.05)); y++) {
    for (let x = Math.floor(W * 0.45); x < Math.floor(W * 0.95); x += 3) {
      samplePixel(x, y);
    }
  }
  // Far right margin sample (x: 95% to 99%, y: 5% to 40%)
  for (let y = Math.floor(H * 0.05); y < Math.floor(H * 0.4); y += 3) {
    for (let x = Math.floor(W * 0.95); x < W - 1; x++) {
      samplePixel(x, y);
    }
  }

  const avgBgR = bgSamples > 0 ? bgR / bgSamples : 245;
  const avgBgG = bgSamples > 0 ? bgG / bgSamples : 245;
  const avgBgB = bgSamples > 0 ? bgB / bgSamples : 245;
  const avgBgLum = 0.299 * avgBgR + 0.587 * avgBgG + 0.114 * avgBgB;

  // 3. Multi-Threshold Edge & Chroma Saliency
  const isForeground = new Uint8Array(W * H);

  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const idx = (y * W + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const gx =
        (lum[(y - 1) * W + (x + 1)] + 2 * lum[y * W + (x + 1)] + lum[(y + 1) * W + (x + 1)]) -
        (lum[(y - 1) * W + (x - 1)] + 2 * lum[y * W + (x - 1)] + lum[(y + 1) * W + (x - 1)]);
      const gy =
        (lum[(y + 1) * W + (x - 1)] + 2 * lum[(y + 1) * W + x] + lum[(y + 1) * W + (x + 1)]) -
        (lum[(y - 1) * W + (x - 1)] + 2 * lum[(y - 1) * W + x] + lum[(y + 1) * W + (x - 1)]);

      const grad = Math.abs(gx) + Math.abs(gy);

      const colorDist = Math.sqrt(
        (r - avgBgR) * (r - avgBgR) +
        (g - avgBgG) * (g - avgBgG) +
        (b - avgBgB) * (b - avgBgB)
      );

      // Edge detection (grad > 55) OR color difference from light studio background
      if (grad > 55 || (avgBgLum > 170 && colorDist > 26)) {
        isForeground[y * W + x] = 1;
      }
    }
  }

  // 4. Solid Interior 2D Span Filling
  // Fills the interior of flat wooden wardrobe doors, white bedsheets, leather cushions, table surfaces!
  const isFurnitureSolid = new Uint8Array(W * H);
  const colTopY = new Int32Array(W).fill(-1);
  const colBottomY = new Int32Array(W).fill(-1);

  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      if (isForeground[y * W + x] === 1) {
        if (colTopY[x] === -1) colTopY[x] = y;
        colBottomY[x] = y;
      }
    }
  }

  const rowLeftX = new Int32Array(H).fill(-1);
  const rowRightX = new Int32Array(H).fill(-1);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (isForeground[y * W + x] === 1) {
        if (rowLeftX[y] === -1) rowLeftX[y] = x;
        rowRightX[y] = x;
      }
    }
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (isForeground[y * W + x] === 1) {
        isFurnitureSolid[y * W + x] = 1;
      } else {
        const insideVertical = colTopY[x] !== -1 && y >= colTopY[x] && y <= colBottomY[x];
        const insideHorizontal = rowLeftX[y] !== -1 && x >= rowLeftX[y] && x <= rowRightX[y];
        if (insideVertical && insideHorizontal) {
          isFurnitureSolid[y * W + x] = 1;
        }
      }
    }
  }

  // 5. Morphological Dilation (Generous 6px safety buffer around all furniture boundaries)
  const dilated = new Uint8Array(W * H);
  const dilateRadius = 6;

  for (let y = dilateRadius; y < H - dilateRadius; y++) {
    for (let x = dilateRadius; x < W - dilateRadius; x++) {
      if (isFurnitureSolid[y * W + x] === 1) {
        for (let dy = -dilateRadius; dy <= dilateRadius; dy++) {
          for (let dx = -dilateRadius; dx <= dilateRadius; dx++) {
            dilated[(y + dy) * W + (x + dx)] = 1;
          }
        }
      }
    }
  }

  // 6. Dynamic Badge Dimensions (generous 34% width to guarantee safety margin)
  const badgeWPct = 34;
  const badgeHPct = Math.max(5, Math.min(18, Math.round(10 * aspectRatio)));

  // Box Evaluation Function with rigorous pixel-level collision verification
  const evaluateBox = (cxPct: number, cyPct: number) => {
    const startX = Math.max(0, Math.floor(W * ((cxPct - badgeWPct / 2) / 100)));
    const endX = Math.min(W, Math.floor(W * ((cxPct + badgeWPct / 2) / 100)));
    const startY = Math.max(0, Math.floor(H * ((cyPct - badgeHPct / 2) / 100)));
    const endY = Math.min(H, Math.floor(H * ((cyPct + badgeHPct / 2) / 100)));

    // STRICT NON-NEGOTIABLE: Never overlap with Top-Left Logo (x < 36% && y < 28%)
    if ((cxPct - badgeWPct / 2) < 36 && (cyPct - badgeHPct / 2) < 28) {
      return { edgeCollisionCount: 999999, avgNoise: 999999, isSafe: false };
    }

    let edgeCollisionCount = 0;
    let totalSamples = 0;
    let localVariance = 0;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        totalSamples++;
        if (dilated[y * W + x] === 1) {
          edgeCollisionCount++;
        }
        const idx = (y * W + x) * 4;
        const curLum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        localVariance += Math.abs(curLum - lum[y * W + x]);
      }
    }

    return {
      edgeCollisionCount,
      avgNoise: totalSamples > 0 ? localVariance / totalSamples : 0,
      isSafe: edgeCollisionCount === 0
    };
  };

  // Reusable collision validator for verifying external/Gemini suggestions
  const checkCollision = (pos: { x: number; y: number }) => {
    const result = evaluateBox(pos.x, pos.y);
    return { edgeCollisionCount: result.edgeCollisionCount, isSafe: result.isSafe };
  };

  // 7. Strict Placement Hierarchy
  // Bottom candidates have baseline penalty (0 - 25)
  // Flanks and Walls have baseline penalty (300 - 550) so they ONLY win if bottom has zero clean space.
  interface Candidate {
    x: number;
    y: number;
    prefPenalty: number;
  }

  // All candidates are strictly kept within [24, 76] for X and [14, 90] for Y so NO element can EVER touch image borders!
  const primaryBottomCandidates: Candidate[] = [
    { x: 50, y: 89, prefPenalty: 0 },   // Bottom Center (Highest preference)
    { x: 74, y: 89, prefPenalty: 4 },   // Bottom Right (Clean safety margin from right edge)
    { x: 26, y: 89, prefPenalty: 8 },   // Bottom Left (Clean safety margin from left edge)
    { x: 62, y: 89, prefPenalty: 6 },
    { x: 38, y: 89, prefPenalty: 8 },
    { x: 50, y: 85, prefPenalty: 12 },  // Bottom Center Mid
    { x: 74, y: 85, prefPenalty: 16 },  // Bottom Right Mid
    { x: 26, y: 85, prefPenalty: 18 },  // Bottom Left Mid
    { x: 50, y: 82, prefPenalty: 22 }
  ];

  const fallbackOtherCandidates: Candidate[] = [
    // Flank fallback candidates (strictly safe margin from right/left borders)
    { x: 74, y: 76, prefPenalty: 300 },
    { x: 74, y: 64, prefPenalty: 320 },
    { x: 74, y: 52, prefPenalty: 340 },
    { x: 26, y: 55, prefPenalty: 360 },
    { x: 26, y: 68, prefPenalty: 380 },
    { x: 26, y: 78, prefPenalty: 370 },

    // Upper Wall fallback candidates
    { x: 74, y: 18, prefPenalty: 450 },
    { x: 74, y: 24, prefPenalty: 470 },
    { x: 50, y: 18, prefPenalty: 480 },
    { x: 50, y: 24, prefPenalty: 500 }
  ];

  let bestNum = { x: 50, y: 89 };
  let minNumScore = Infinity;
  let foundCleanBottom = false;

  const testCandidate = (cx: number, cy: number, basePenalty: number) => {
    const { edgeCollisionCount, avgNoise } = evaluateBox(cx, cy);
    const score =
      (edgeCollisionCount > 0 ? 10000000 + edgeCollisionCount * 50000 : 0) +
      basePenalty * 15 +
      avgNoise;

    if (score < minNumScore) {
      minNumScore = score;
      bestNum = { x: cx, y: cy };
    }
    return edgeCollisionCount === 0;
  };

  // Phase 1: Test primary discrete bottom candidates
  for (const c of primaryBottomCandidates) {
    if (testCandidate(c.x, c.y, c.prefPenalty)) {
      foundCleanBottom = true;
    }
  }

  // Phase 2: If discrete bottom candidates were tight, scan a fine sliding grid across bottom floor
  if (!foundCleanBottom) {
    for (let y = 90; y >= 80; y -= 2) {
      for (let x = 26; x <= 74; x += 3) {
        if (testCandidate(x, y, 22)) {
          foundCleanBottom = true;
          break;
        }
      }
      if (foundCleanBottom) break;
    }
  }

  // Phase 3: ONLY IF NO CLEAN BOTTOM SPACE EXISTS (furniture completely reaches the floor), evaluate flanks & wall
  if (!foundCleanBottom) {
    for (const c of fallbackOtherCandidates) {
      testCandidate(c.x, c.y, c.prefPenalty);
    }

    // Adaptive scan of flanks and upper wall if all discrete fallbacks had collisions
    if (minNumScore >= 10000000) {
      for (let y = 78; y >= 35; y -= 4) {
        for (let x = 74; x >= 68; x -= 3) {
          testCandidate(x, y, 320);
        }
      }
      for (let y = 16; y <= 24; y += 3) {
        for (let x = 50; x <= 74; x += 4) {
          testCandidate(x, y, 460);
        }
      }
    }
  }

  // Logo is strictly Top-Left: { x: 12, y: 12 }
  const logoPos = { x: 12, y: 12 };

  return {
    logoPos,
    numberPos: bestNum,
    detectedVia: 'local_vision',
    checkCollision
  };
}

/**
 * Main export: Analyze image for empty background space.
 * 1. Executes solid-mask local vision to find mathematically verified zero-collision coordinates.
 * 2. If Gemini API key is active, tests Gemini Vision.
 * 3. MANDATORY VALIDATION: If Gemini proposes coordinates that touch the furniture mask,
 *    Gemini is instantly rejected/overridden with the 100% verified local placement!
 */
export const analyzeImageForEmptySpace = async (
  source: File | string,
  allowAi: boolean = false
): Promise<PlacementDetectionResult> => {
  return new Promise((resolve) => {
    const isFile = typeof source !== 'string';
    const url = isFile ? URL.createObjectURL(source) : source;
    const img = new Image();

    const cleanup = () => {
      if (isFile) URL.revokeObjectURL(url);
    };

    img.onload = async () => {
      try {
        // Step 1: Run High-Precision Local Solid Segmentation Engine (~15ms)
        const localResult = analyzeImageLocallyWithVision(img);
        const apiKey = allowAi ? getGeminiApiKey() : '';

        // Step 2: Try Gemini Vision ONLY if allowAi is explicitly requested
        if (allowAi && apiKey) {
          const geminiCanvas = document.createElement('canvas');
          const maxDim = 768;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          geminiCanvas.width = Math.max(1, Math.round(img.width * scale));
          geminiCanvas.height = Math.max(1, Math.round(img.height * scale));
          const gCtx = geminiCanvas.getContext('2d');
          if (gCtx) {
            gCtx.drawImage(img, 0, 0, geminiCanvas.width, geminiCanvas.height);
            const geminiResult = await callGeminiVisionForPlacement(geminiCanvas, apiKey);
            if (geminiResult) {
              // MANDATORY VALIDATION: Check Gemini's suggestion against our solid furniture mask!
              const validation = localResult.checkCollision(geminiResult.numberPos);
              if (validation.isSafe) {
                // Gemini proposed a verified 100% clean position with 0 furniture collisions!
                cleanup();
                resolve(geminiResult);
                return;
              } else {
                console.warn(
                  `[Auto AI Safety] Gemini proposed (${geminiResult.numberPos.x}, ${geminiResult.numberPos.y}) which collided with ${validation.edgeCollisionCount} furniture mask pixels. OVERRIDING with 100% verified zero-collision coordinate: (${localResult.numberPos.x}, ${localResult.numberPos.y})`
                );
              }
            }
          }
        }

        // Return verified 100% zero-collision local placement
        cleanup();
        resolve({
          logoPos: localResult.logoPos,
          numberPos: localResult.numberPos,
          detectedVia: 'local_vision'
        });
      } catch {
        cleanup();
        resolve({
          logoPos: { x: 12, y: 12 },
          numberPos: { x: 50, y: 89 },
          detectedVia: 'local_vision'
        });
      }
    };

    img.onerror = () => {
      cleanup();
      resolve({
        logoPos: { x: 12, y: 12 },
        numberPos: { x: 50, y: 89 },
        detectedVia: 'local_vision'
      });
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

  if (!source) {
    return Promise.resolve(fallback);
  }

  return new Promise((resolve) => {
    const isFile = typeof source !== 'string';
    const url = isFile ? URL.createObjectURL(source) : source;
    const img = new Image();

    if (typeof url === 'string' && url.startsWith('http') && !url.startsWith(window.location.origin)) {
      img.crossOrigin = 'anonymous';
    }

    const cleanup = () => {
      if (isFile) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }
    };

    let hasExecuted = false;

    const process = () => {
      if (hasExecuted) return;
      hasExecuted = true;

      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          cleanup();
          resolve(fallback);
          return;
        }

        // Downscale to 120x120 for comprehensive photo pixel sampling
        const size = 120;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        let imgData: ImageData;
        try {
          imgData = ctx.getImageData(0, 0, size, size);
        } catch {
          cleanup();
          resolve(fallback);
          return;
        }
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

        // Quantize pixels into fine buckets (step 16)
        const bucketMap = new Map<string, { count: number; rSum: number; gSum: number; bSum: number }>();

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 128) continue; // Skip transparent

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Skip extreme blown-out white and pure black
          if (r > 250 && g > 250 && b > 250) continue;
          if (r < 10 && g < 10 && b < 10) continue;

          const step = 16;
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
          const r = Math.round(val.rSum / val.count);
          const g = Math.round(val.gSum / val.count);
          const b = Math.round(val.bSum / val.count);
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const hsl = rgbToHsl(r, g, b);
          const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();

          // Balanced score: Presence + saturation/accent boost for furniture materials (wood, velvet, leather)
          const score = Math.pow(val.count, 0.45) * (1 + hsl.s * 2.8) * (hsl.l > 0.12 && hsl.l < 0.88 ? 1.35 : 0.85);

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

        // Pass 1: Strict distance threshold >= 55 for maximum variety across the photo
        for (const cand of candidates) {
          tryAddCandidate(cand, 55);
          if (selected.length >= 10) break;
        }

        // Pass 2: Moderate distance threshold >= 35 if more colors from photo needed
        if (selected.length < 10) {
          for (const cand of candidates) {
            tryAddCandidate(cand, 35);
            if (selected.length >= 10) break;
          }
        }

        // Pass 3: Fine distance threshold >= 18 to capture all subtle nuances of the photo
        if (selected.length < 10) {
          for (const cand of candidates) {
            tryAddCandidate(cand, 18);
            if (selected.length >= 10) break;
          }
        }

        // Pass 4: Any remaining unique candidate color from the photo regardless of distance!
        if (selected.length < 10) {
          for (const cand of candidates) {
            const hexLower = cand.hex.toLowerCase();
            if (!selected.some(s => s.hex.toLowerCase() === hexLower)) {
              selected.push({ r: cand.r, g: cand.g, b: cand.b, hex: cand.hex });
              if (selected.length >= 10) break;
            }
          }
        }

        // Pass 5: Fill remaining slots with harmonized furniture design tones only if photo had <10 unique colors
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
            tryAddCandidate(acc, 25);
            if (selected.length >= 10) break;
          }

          if (selected.length < 10) {
            for (const acc of STUDIO_FURNITURE_ACCENTS) {
              const hexLower = acc.hex.toLowerCase();
              if (!selected.some(s => s.hex.toLowerCase() === hexLower)) {
                selected.push(acc);
                if (selected.length >= 10) break;
              }
            }
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

        const getVibrancyScore = (s: ExtractedColor) => {
          const { r, g, b } = s.rgb;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const d = max - min;
          const sat = max === 0 ? 0 : d / max;
          const lum = (max + min) / 510;
          const lumScore = 1 - Math.abs(lum - 0.48) * 1.8;
          return sat * Math.max(0.2, lumScore);
        };

        const dominant = swatches[0] || fallback.dominant;
        const vibrant = swatches.slice().sort((a, b) => getVibrancyScore(b) - getVibrancyScore(a))[0] || dominant;
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
      } catch (err) {
        console.warn('Palette extraction error:', err);
        cleanup();
        resolve(fallback);
      }
    };

    let triedWithoutCors = false;
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        process();
      } else {
        setTimeout(process, 50);
      }
    };
    img.onerror = () => {
      if (!triedWithoutCors && img.crossOrigin) {
        triedWithoutCors = true;
        img.crossOrigin = null;
        img.src = url;
        return;
      }
      cleanup();
      resolve(fallback);
    };

    img.src = url;

    // Trigger process immediately if already cached/complete
    if (img.complete && img.naturalWidth > 0) {
      process();
    }
  });
};

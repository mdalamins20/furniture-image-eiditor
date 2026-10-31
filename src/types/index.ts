export interface ImageSetting {
  logoPos: { x: number; y: number };
  numberPos: { x: number; y: number };
  watermarkPos: { x: number; y: number };
  isLogoPosManual: boolean;
  isNumberPosManual: boolean;
  isWatermarkPosManual: boolean;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  warmth?: number;
  assignedShowroom?: ShowroomItem;
  logoUrl?: string;
  numberText?: string;
  logoSize?: number;
  enableLogoShadow?: boolean;
  logoShadowColor?: string;
  logoShadowBlur?: number;
  logoShadowIntensity?: number;
  numberColor?: string;
  numberBgColor?: string;
  isNumberColorManual?: boolean;
  numberSize?: number;
  letterSpacing?: number;
  lineHeight?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  padX?: number;
  padY?: number;
  customRadius?: number;
  fontFamily?: string;
  numberStyle?: 'solid' | 'transparent' | 'outline';
  numberOutlineThickness?: number;
  numberOutlineBlur?: number;
  enableWatermark?: boolean;
  watermarkText?: string;
  watermarkStyle?: 'diagonal' | 'grid' | 'horizontal' | 'custom';
  watermarkOpacity?: number;
  watermarkSize?: number;
  watermarkColor?: string;
  watermarkFontFamily?: string;
  watermarkFontWeight?: 'normal' | 'bold';
  watermarkFontStyle?: 'normal' | 'italic';
  watermarkTextDecoration?: 'none' | 'underline' | 'line-through';
  watermarkTextTransform?: 'none' | 'uppercase' | 'lowercase';
  watermarkLetterSpacing?: number;
  watermarkCustomAngle?: number;
  watermarkIsGrid?: boolean;
  watermarkGridSpacing?: number;
}

export interface EditorSnapshot {
  imageSettings: ImageSetting[];
  globalState: {
    selectedShowroom: string;
    logoUrl: string | null;
    numberText: string;
    fontFamily: string;
    logoSize: number;
    enableLogoShadow: boolean;
    logoShadowColor: string;
    logoShadowBlur: number;
    logoShadowIntensity: number;
    numberColor: string;
    numberBgColor: string;
    numberSize: number;
    letterSpacing: number;
    lineHeight: number;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline' | 'line-through';
    textTransform: 'none' | 'uppercase' | 'lowercase';
    padX: number;
    padY: number;
    customRadius: number;
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
    numberStyle: 'solid' | 'transparent' | 'outline';
    numberOutlineThickness: number;
    numberOutlineBlur: number;
    enableWatermark: boolean;
    watermarkText: string;
    watermarkStyle: 'diagonal' | 'grid' | 'horizontal' | 'custom';
    watermarkOpacity: number;
    watermarkSize: number;
    watermarkColor: string;
    watermarkFontFamily: string;
    watermarkFontWeight: 'normal' | 'bold';
    watermarkFontStyle: 'normal' | 'italic';
    watermarkTextDecoration: 'none' | 'underline' | 'line-through';
    watermarkTextTransform: 'none' | 'uppercase' | 'lowercase';
    watermarkLetterSpacing: number;
    watermarkCustomAngle: number;
    watermarkIsGrid: boolean;
    watermarkGridSpacing: number;
    // Optional so old snapshots (without these fields) still restore.
    defaultLogoPos?: { x: number; y: number };
    defaultNumberPos?: { x: number; y: number };
    defaultWatermarkPos?: { x: number; y: number };
    downloadFormat?: 'jpeg' | 'png' | 'webp';
  };
}

export interface ShowroomItem {
  id: string;
  name: string;
  numbers: string;
  file?: string;
  logoUrl?: string;
  isDefault?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Hardcoded Showrooms List (Commented out as requested - All showrooms and logos now run dynamically from Online Cloud / Firestore)
 * To restore built-in offline presets in the future, simply uncomment this block:
 * 
 * export const HARDCODED_DEFAULT_SHOWROOMS: ShowroomItem[] = [
 *   { id: 'dewan-1', name: 'Dewan Furniture', isDefault: true, numbers: '01873-728219\n01322-631984', file: 'Dewan Furniture.png' },
 *   { id: 'dewan-2', name: 'Dewan Furniture 2', isDefault: true, numbers: '01955-393478\n01610-605366', file: 'Dewan Furniture 2.png' },
 *   { id: 'nogor', name: 'Nogor furniture', isDefault: true, numbers: '01781-573405\n01756-806415', file: 'Nogor Furniture.png' },
 *   { id: 'nojor', name: 'Nojor Furniture', isDefault: true, numbers: '01756-806415\n01781-573405', file: 'Nojor Furniture.png' },
 *   { id: 'discount', name: 'Discount Furniture', isDefault: true, numbers: '01744-496680\n01766-685921', file: 'Discount Furniture.png' },
 *   { id: 'ador', name: 'Ador Furniture', isDefault: true, numbers: '01906-210981\n01620-909541', file: 'Ador Furniture.png' },
 *   { id: 'adarsha', name: 'Adarsha Furniture', isDefault: true, numbers: '01745-620742\n01823-411301', file: 'Adarsha Furniture.png' },
 *   { id: 'adarsha-badda', name: 'Adarsha Furniture Badda', isDefault: true, numbers: '01823-411301\n01745-620742', file: 'Adarsha Furniture Badda.png' },
 *   { id: 'eagle', name: 'Eagle Furniture', isDefault: true, numbers: '01973-320030\n01321-665440', file: 'Eagle Furniture.png' },
 *   { id: 'eagle-badda', name: 'Eagle Furniture Badda', isDefault: true, numbers: '01973-320030\n01321-665440', file: 'Eagle Furniture Badda.png' },
 *   { id: 'doyel', name: 'Doyel Furniture', isDefault: true, numbers: '01709-694631\n01744-499150', file: 'Doyel Furniture.png' },
 *   { id: 'kakolo', name: 'Kakolo Furniture', isDefault: true, numbers: '01973-728219', file: 'Kakolo Furniture.png' },
 *   { id: 'kashful', name: 'Kashful Furniture', isDefault: true, numbers: '01314-712633\n01314-868410', file: 'Kashful Furniture.png' },
 *   { id: 'badda-bazar', name: 'Badda Furniture Bazar', isDefault: true, numbers: '01314-719218\n01810-647896', file: '12. Badda Furniture Bazar.png' },
 *   { id: 'center', name: 'Center Furniture', isDefault: true, numbers: '01758-179012\n01314-614463', file: 'Center Furniture.png' },
 *   { id: 'juboraj', name: 'Juboraj Furniture', isDefault: true, numbers: '01314-934244\n01860-578326', file: 'Juboraj Furniture.png' },
 *   { id: 'moniraj', name: 'Moniraj Furniture', isDefault: true, numbers: '01314-834419\n01335-088103', file: 'Moniraj Furniture.png' },
 * ];
 */
export const SHOWROOMS: ShowroomItem[] = [];

export const FONTS = [
  // Only fonts actually loaded in index.html are listed here. The old
  // list included Kalpurush, Century, Cambria, Acumin, Amerigo and Arrus,
  // none of which are loaded, so picking them silently fell back.
  
  // High-Quality Bengali Fonts (Google Fonts)
  { name: 'Hind Siliguri', family: '"Hind Siliguri", sans-serif' },
  { name: 'Tiro Bangla', family: '"Tiro Bangla", serif' },
  { name: 'Noto Serif Bengali', family: '"Noto Serif Bengali", serif' },
  { name: 'Noto Sans Bengali', family: '"Noto Sans Bengali", sans-serif' },
  { name: 'Mina', family: '"Mina", sans-serif' },
  { name: 'Galada', family: '"Galada", cursive' },
  
  // High-Quality English Fonts (Google Fonts)
  { name: 'Roboto', family: '"Roboto", sans-serif' },
  { name: 'Inter', family: '"Inter", sans-serif' },
  { name: 'Poppins', family: '"Poppins", sans-serif' },
  { name: 'Montserrat', family: '"Montserrat", sans-serif' },
  { name: 'Oswald', family: '"Oswald", sans-serif' },
  { name: 'Lora', family: '"Lora", serif' },
  { name: 'Merriweather', family: '"Merriweather", serif' },
  { name: 'Playfair Display', family: '"Playfair Display", serif' },
];

export const COLORS = [
  { id: 'yellow', value: '#FFD700', text: '#000000' },
  { id: 'black', value: '#000000', text: '#FFFFFF' },
  { id: 'white', value: '#FFFFFF', text: '#000000' },
  { id: 'red', value: '#EF4444', text: '#FFFFFF' },
  { id: 'blue', value: '#3B82F6', text: '#FFFFFF' },
  { id: 'green', value: '#10B981', text: '#FFFFFF' },
  { id: 'purple', value: '#8B5CF6', text: '#FFFFFF' },
  { id: 'dark-green', value: '#064E3B', text: '#FFFFFF' },
  { id: 'pink', value: '#EC4899', text: '#FFFFFF' },
  { id: 'cyan', value: '#06B6D4', text: '#FFFFFF' },
  { id: 'orange', value: '#F59E0B', text: '#FFFFFF' },
  { id: 'brown', value: '#78350F', text: '#FFFFFF' },
  { id: 'maroon', value: '#7F1D1D', text: '#FFFFFF' },
  { id: 'gray', value: '#F3F4F6', text: '#111827' },
  { id: 'dark', value: '#111827', text: '#FFFFFF' },
];

export type AppModuleType = 'hub' | 'daily-post' | 'photo-card' | 'boost-ads' | 'profile';

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
  assignedShowroom?: typeof SHOWROOMS[0];
  logoUrl?: string;
  numberText?: string;
  logoSize?: number;
  enableLogoShadow?: boolean;
  logoShadowColor?: string;
  logoShadowBlur?: number;
  logoShadowIntensity?: number;
  numberColor?: string;
  numberBgColor?: string;
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
  };
}

export const SHOWROOMS = [
  { name: 'Dewan Furniture', numbers: '01873-728219\n01322-631984', file: 'Dewan Furniture.png' },
  { name: 'Dewan Furniture 2', numbers: '01955-393478\n01610-605366', file: 'Dewan Furniture 2.png' },
  { name: 'Nogor furniture', numbers: '01781-573405', file: 'Nogor Furniture.png' },
  { name: 'Nojor Furniture', numbers: '01756-806415', file: 'Nojor Furniture.png' },
  { name: 'Discount Furniture', numbers: '01744-496680\n01766-685921', file: 'Discount Furniture.png' },
  { name: 'Ador Furniture', numbers: '01906210981\n01620909541', file: 'Ador Furniture.png' },
  { name: 'Adarsha Furniture', numbers: '01745-620742\n01823-411301', file: 'Adarsha Furniture.png' },
  { name: 'Adarsha Furniture Badda', numbers: '01823-411301\n01745-620742', file: 'Adarsha Furniture Badda.png' },
  { name: 'Eagle Furniture', numbers: '01973-320030\n01321-665440', file: 'Eagle Furniture.png' },
  { name: 'Eagle Furniture Badda', numbers: '01321-665440\n01973-320030', file: 'Eagle Furniture Badda.png' },
  { name: 'Doyel Furniture', numbers: '01709-694631\n01744-499150', file: 'Doyel Furniture.png' },
  { name: 'Kakolo Furniture', numbers: '01973-728219', file: 'Kakolo Furniture.png' },
  { name: 'Kashful Furniture', numbers: '01314-712633\n01314-868410', file: 'Kashful Furniture.png' },
  { name: 'Badda Furniture Bazar', numbers: '01314-719218\n01810-647896', file: '12. Badda Furniture Bazar.png' },
  { name: 'Center Furniture', numbers: '01758-179012\n01314-614463', file: 'Center Furniture.png' },
  { name: 'Juboraj Furniture', numbers: '01314-934244\n01860-578326', file: 'Juboraj Furniture.png' },
  { name: 'Moniraj Furniture', numbers: '01314-834419\n01335-088103', file: 'Moniraj Furniture.png' },
];

export const FONTS = [
  // User Requested Custom Fonts (With Exact Names + High-Quality Google Font Fallbacks)
  { name: 'Kalpurush', family: '"Kalpurush", "Hind Siliguri", sans-serif' },
  { name: 'Century', family: '"Century", "PT Serif", serif' },
  { name: 'Cambria', family: '"Cambria", "Lora", serif' },
  { name: 'Acumin Variable Concept', family: '"Acumin Variable Concept", "Inter", sans-serif' },
  { name: 'Amerigo BT', family: '"Amerigo BT", "Merriweather", serif' },
  { name: 'Arrus Blk BT', family: '"Arrus Blk BT", "Playfair Display", serif' },
  
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

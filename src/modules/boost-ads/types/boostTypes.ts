export type CardTheme = 'dark-glass' | 'luxury-gold' | 'clean-white' | 'brand-blue' | 'minimal-transparent';
export type BadgeDisplayStyle = 'solid' | 'transparent' | 'outline';
export type SidebarTab = 'showroom' | 'card' | 'logo';
export type PriceBadgeStyle = 'pill' | 'tag' | 'clean';
export type SelectedElement = 'card' | 'logo' | 'price';

export interface AdImageSettings {
  cardPos?: { x: number; y: number };
  logoPos?: { x: number; y: number };
  pricePos?: { x: number; y: number };
  cardScale?: number;
  logoSize?: number;
  priceScale?: number;
  cardOpacity?: number;
  cardTheme?: CardTheme;
  cardMargin?: number;
  showLogo?: boolean;
  showShowroomName?: boolean;
  selectedShowroomName?: string;
  fontFamily?: string;
  enableSeparatePrice?: boolean;
  showMainPriceInCard?: boolean;
  showCutPrice?: boolean;
  minimalTextColor?: 'dark' | 'light';
  priceBadgeStyle?: PriceBadgeStyle;
  badgeDisplayStyle?: BadgeDisplayStyle;
  customBgColor?: string;
  customTextColor?: string;
  outlineThickness?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  lineHeight?: number;
  letterSpacing?: number;
  customRadius?: number;
  customPadX?: number;
  customPadY?: number;
  customTitleColor?: string;
  customMLabelColor?: string;
  customMValueColor?: string;
  customPLabelColor?: string;
  customCutPriceColor?: string;
  customActualPriceColor?: string;
  customPhoneColor?: string;
  actualPriceScale?: number;
  enableLogoShadow?: boolean;
  logoShadowColor?: string;
  logoShadowBlur?: number;
  logoShadowOffsetY?: number;
}

export interface AdImageItem {
  id: string;
  file: File;
  url: string;
  name: string;
  modelNumber: string;
  price: string;
  cutPrice?: string;
  cardPos?: { x: number; y: number };
  logoPos?: { x: number; y: number };
  pricePos?: { x: number; y: number };
  settings?: AdImageSettings;
}

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface BoostSnapshot {
  images?: AdImageItem[];
  selectedImageIds?: string[];
  cardPos: { x: number; y: number };
  logoPos: { x: number; y: number };
  pricePos: { x: number; y: number };
  cardScale: number;
  logoSize: number;
  priceScale: number;
  cardOpacity: number;
  cardTheme: CardTheme;
  cardMargin: number;
  showLogo: boolean;
  showShowroomName: boolean;
  selectedShowroomName: string;
  fontFamily: string;
  enableSeparatePrice: boolean;
  showMainPriceInCard: boolean;
  showCutPrice: boolean;
  customLowMarkup: number;
  customMidMarkup: number;
  customHighMarkup: number;
  minimalTextColor: 'dark' | 'light';
  priceBadgeStyle: PriceBadgeStyle;
  // Badge display & styling options
  badgeDisplayStyle: BadgeDisplayStyle;
  customBgColor: string;
  customTextColor: string;
  outlineThickness: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textTransform: 'none' | 'uppercase' | 'lowercase';
  lineHeight: number;
  letterSpacing: number;
  customRadius: number;
  customPadX: number;
  customPadY: number;
  // Individual element color overrides
  customTitleColor?: string;
  customMLabelColor?: string;
  customMValueColor?: string;
  customPLabelColor?: string;
  customCutPriceColor?: string;
  customActualPriceColor?: string;
  customPhoneColor?: string;
  // Actual price font size multiplier
  actualPriceScale?: number;
  // Logo shadow options
  enableLogoShadow?: boolean;
  logoShadowColor?: string;
  logoShadowBlur?: number;
  logoShadowOffsetY?: number;
}

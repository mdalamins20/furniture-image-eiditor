import { describe, expect, it } from 'vitest';
import {
  extractNumericPrice,
  parsePriceFromFilename,
  calculateAutoCutPrice,
} from './priceCalculators';

describe('extractNumericPrice', () => {
  it('keeps decimals as thousands: 25.5 -> 25,500, not 255,000', () => {
    expect(extractNumericPrice('25.5')).toBe(25500);
  });
  it('parses full amounts with commas and suffix', () => {
    expect(extractNumericPrice('19,000/-')).toBe(19000);
  });
  it('parses Bengali digits', () => {
    expect(extractNumericPrice('১৯,০০০')).toBe(19000);
  });
});

describe('parsePriceFromFilename', () => {
  it('does not treat a model number as a price', () => {
    expect(parsePriceFromFilename('model 101.jpg')).toBe('');
  });
  it('parses a plain thousands price', () => {
    expect(parsePriceFromFilename('sofa 25.jpg')).toBe('25,000/-');
  });
  it('parses decimal thousands', () => {
    expect(parsePriceFromFilename('25.5.jpg')).toBe('25,500/-');
  });
});

describe('calculateAutoCutPrice', () => {
  it('keeps the screenshot case: 19,000 -> 23,000', () => {
    expect(calculateAutoCutPrice(19000)).toBe(23000);
  });
  it('is monotonic: no tier jump (22,000 -> 26,000, 23,000 must stay far below 33,000)', () => {
    expect(calculateAutoCutPrice(22000)).toBe(26000);
    expect(calculateAutoCutPrice(23000)).toBeLessThan(30000);
    let prev = 0;
    for (let amount = 21000; amount <= 40000; amount += 1000) {
      const cut = calculateAutoCutPrice(amount);
      expect(cut).toBeGreaterThanOrEqual(prev);
      prev = cut;
    }
  });
});

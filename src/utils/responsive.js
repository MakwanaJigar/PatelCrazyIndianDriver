import { Dimensions, PixelRatio } from 'react-native';

// ============================================================
// RESPONSIVE HELPERS
// ------------------------------------------------------------
// Every screen was designed against a different mockup width,
// so each screen calls createScaler(<its design width>) and gets
// back two helpers:
//
//   rs(size) -> layout sizes  (width, height, padding, radius...)
//   fs(size) -> font sizes    (fontSize, lineHeight)
//
// fs() differs from rs() in three ways:
//   1. It never goes below MIN_FONT_SIZE, so small labels stay
//      readable on every phone.
//   2. It respects the phone's "Font size" accessibility setting,
//      but caps it at MAX_FONT_SCALE so big system fonts can't
//      break the layout.
//   3. It rounds to a whole pixel so text renders crisply.
// ============================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tablets / foldables: stop scaling after this width so
// everything doesn't become huge.
const MAX_SCALE_WIDTH = 480;

const MIN_FONT_SIZE = 10;
const MAX_FONT_SCALE = 1.2;

export const createScaler = (designWidth, minFactor = 0.84) => {
  const scale = Math.min(SCREEN_WIDTH, MAX_SCALE_WIDTH) / designWidth;

  const rs = size => Math.max(size * scale, size * minFactor);

  const fs = size => {
    const systemFontScale = PixelRatio.getFontScale();
    const allowedFontScale = Math.min(systemFontScale, MAX_FONT_SCALE);

    // RN multiplies fontSize by systemFontScale automatically,
    // so divide it out and apply our capped scale instead.
    const scaled =
      (Math.max(rs(size), MIN_FONT_SIZE) * allowedFontScale) /
      systemFontScale;

    return Math.round(PixelRatio.roundToNearestPixel(scaled));
  };

  return { rs, fs };
};

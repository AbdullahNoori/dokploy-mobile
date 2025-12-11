import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

const baseWidth = 350;
const baseHeight = 680;

/**
 * Scale - Take a size and scale it based on the
 * ratio of the screen width to the base width.
 * @param size The size to scale.
 * @returns The scaled size.
 */
export function s(size: number): number {
  return (width / baseWidth) * size;
}

/**
 * Scale Vertical - Take a size and scale it
 * based on the ratio of the screen height to the base height.
 * @param size The size to scale.
 * @returns The scaled size.
 */
export function sv(size: number): number {
  return (height / baseHeight) * size;
}

/**
 * Scale Moderate - Take a size and combines both
 * horizontal and vertical scaling based on the screen size.
 * @param size The size to scale.
 * @param factor The factor to scale by.
 * @returns The scaled size.
 */
export function sm(size: number, factor = 0.5): number {
  return size + (s(size) - size) * factor;
}

/**
 * Convert a pixel value to DP.
 * @param px The pixel value to convert.
 * @returns The converted value.
 */
export function px2dp(px: number): number {
  return px / PixelRatio.get();
}

/**
 * Convert a DP value to pixel.
 * @param dp The DP value to convert.
 * @returns The converted value.
 */
export function dp2px(dp: number): number {
  return dp * PixelRatio.get();
}

/**
 * Convert a percent value to DP.
 * @param percent The percent value to convert.
 * @param isWidth Whether to convert to width or height.
 * @returns The converted value.
 */
export function percentToDP(percent: number, isWidth = true): number {
  if (isWidth) {
    return (percent / 100) * width;
  } else {
    return (percent / 100) * height;
  }
}

/**
 * Convert a DP value to percent.
 * @param dp The DP value to convert.
 * @param isWidth Whether to convert to width or height.
 * @returns The converted value.
 */
export function dpToPercent(dp: number, isWidth = true): number {
  if (isWidth) {
    return (dp / width) * 100;
  } else {
    return (dp / height) * 100;
  }
}

/**
 * Apply opacity to a color.
 * @param color The color to apply opacity to.
 * @param opacityValue The opacity value to apply ranging from 0 to 1.
 * @returns The color with the opacity applied.
 */
export function opacity(color: string, opacityValue: number) {
  const red = parseInt(color.slice(1, 3), 16);
  const green = parseInt(color.slice(3, 5), 16);
  const blue = parseInt(color.slice(5, 7), 16);

  return `rgba(${red}, ${green}, ${blue}, ${opacityValue})`;
}

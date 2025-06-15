/**
 * 부드러운 파스텔 톤의 랜덤 색상을 생성합니다.
 * @returns HSL 형식의 색상 문자열
 */
export const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360); // 0-360 색상
  const saturation = Math.floor(Math.random() * 30) + 70; // 70-100% 채도
  const lightness = Math.floor(Math.random() * 20) + 40; // 40-60% 명도
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * HSL 색상 문자열을 Hex 코드로 변환합니다.
 * @param hslColor - HSL 형식의 색상 문자열 (예: "hsl(360, 100%, 50%)")
 * @returns Hex 형식의 색상 코드 (예: "#FF0000")
 */
export const hslToHex = (hslColor: string) => {
  const matches = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!matches) return "#3B82F6";

  const h = parseInt(matches[1]) / 360;
  const s = parseInt(matches[2]) / 100;
  const l = parseInt(matches[3]) / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}; 
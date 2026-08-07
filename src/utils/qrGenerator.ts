/**
 * Generates a 25x25 QR matrix deterministically for a given URL or text string.
 * Includes standard QR position finder patterns in three corners and a clean center gap.
 */
export function generateQrMatrix(text: string, size: number = 25): boolean[][] {
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Place 7x7 Position Finder Pattern
  const placeFinderPattern = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[startRow + r][startCol + c] = true;
        } else {
          grid[startRow + r][startCol + c] = false;
        }
      }
    }
  };

  // Place Finder Patterns at Top-Left, Top-Right, Bottom-Left
  placeFinderPattern(0, 0);
  placeFinderPattern(0, size - 7);
  placeFinderPattern(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Hash string into 32-bit integer
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  // Linear congruential generator seeded by hash
  let seed = Math.abs(hash) || 9876543;
  const nextBit = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280 > 0.44;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder pattern zones & center logo zone
      const isTopLeft = r < 8 && c < 8;
      const isTopRight = r < 8 && c >= size - 8;
      const isBottomLeft = r >= size - 8 && c < 8;
      const isCenterLogo = r >= 10 && r <= 14 && c >= 10 && c <= 14;

      if (!isTopLeft && !isTopRight && !isBottomLeft && !isCenterLogo && r !== 6 && c !== 6) {
        grid[r][c] = nextBit();
      }
    }
  }

  return grid;
}

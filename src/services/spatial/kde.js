// ============================================================
// VanDrishti AI — 2D Bivariate Gaussian Kernel Density Estimation
// ============================================================
// Computes continuous spatial density surface across study landscape
// using Euclidean metric coordinates in meters.
// ============================================================

/**
 * Evaluates 2D isotropic Gaussian kernel function.
 * @param {number} distance Distance in meters from point to cell centroid
 * @param {number} bandwidth Kernel smoothing bandwidth (h) in meters
 * @returns {number} Density value
 */
export function gaussianKernel(distance, bandwidth) {
  const coefficient = 1 / (2 * Math.PI * bandwidth * bandwidth);
  const exponent = -(distance * distance) / (2 * bandwidth * bandwidth);
  return coefficient * Math.exp(exponent);
}

/**
 * Calculates 2D Kernel Density Estimation across a regular bounding grid.
 *
 * @param {Array<{x: number, y: number}>} points Projected coordinates in UTM meters
 * @param {number} [bandwidth=500] Smoothing parameter (h) in meters
 * @param {number} [gridSize=120] Grid resolution along each axis
 * @returns {Object} KDE grid structure and metadata
 */
export function calculateKDE(points, bandwidth = 500, gridSize = 120) {
  if (!points || points.length === 0) {
    return {
      grid: [],
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      cellWidth: 0,
      cellHeight: 0,
      gridSize: 0,
      maxDensity: 0,
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  // Add padding around observations to capture tail density
  const padding = bandwidth * 3;
  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;

  const cellWidth = (maxX - minX) / gridSize;
  const cellHeight = (maxY - minY) / gridSize;

  const grid = [];
  let maxDensity = 0;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = minX + (col + 0.5) * cellWidth;
      const y = minY + (row + 0.5) * cellHeight;

      let density = 0;
      for (const point of points) {
        const dx = x - point.x;
        const dy = y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Optimization: ignore contributions beyond 4 bandwidths (virtually zero)
        if (distance <= bandwidth * 4) {
          density += gaussianKernel(distance, bandwidth);
        }
      }

      density /= points.length;

      if (density > maxDensity) {
        maxDensity = density;
      }

      grid.push({
        row,
        col,
        x,
        y,
        density,
      });
    }
  }

  return {
    grid,
    minX,
    maxX,
    minY,
    maxY,
    cellWidth,
    cellHeight,
    gridSize,
    maxDensity,
  };
}

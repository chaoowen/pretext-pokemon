/**
 * Analyzes an image's alpha channel to determine the horizontal "solid" range for each row.
 * @param {string} url - The image URL
 * @param {number} targetWidth - The width the image will be rendered at
 * @param {number} targetHeight - The height the image will be rendered at
 * @returns {Promise<Array<{x1: number, x2: number} | null>>} - An array of masks for each y-pixel
 */
export async function getImageAlphaMask(url, targetWidth, targetHeight) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      // Draw image scaled to target size
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
      const mask = [];
      
      for (let y = 0; y < targetHeight; y++) {
        let firstX = -1;
        let lastX = -1;
        
        for (let x = 0; x < targetWidth; x++) {
          const alpha = imageData[(y * targetWidth + x) * 4 + 3]; // Alpha channel
          if (alpha > 50) { // Threshold for "solid"
            if (firstX === -1) firstX = x;
            lastX = x;
          }
        }
        
        if (firstX !== -1) {
          mask.push({ x1: firstX, x2: lastX });
        } else {
          mask.push(null);
        }
      }
      
      resolve(mask);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

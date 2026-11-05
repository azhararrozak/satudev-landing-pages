/**
 * Utility to crop image Blob to target aspect ratio (default 16:9 for article banners)
 * Uses high-performance HTML5 canvas in browser environment.
 */
export async function cropBlobToAspectRatio(
  imageBlob: Blob,
  targetRatio: { w: number; h: number } = { w: 16, h: 9 },
  targetWidth = 1280
): Promise<Blob> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return imageBlob;
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(imageBlob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;

        const ratio = targetRatio.w / targetRatio.h;
        let srcX = 0;
        let srcY = 0;
        let srcWidth = originalWidth;
        let srcHeight = originalHeight;

        const currentRatio = originalWidth / originalHeight;

        if (currentRatio > ratio) {
          // Current is wider than target ratio: crop horizontally
          srcWidth = Math.round(originalHeight * ratio);
          srcX = Math.round((originalWidth - srcWidth) / 2);
        } else {
          // Current is taller than target ratio (e.g. 1:1): center-crop vertically
          srcHeight = Math.round(originalWidth / ratio);
          srcY = Math.round((originalHeight - srcHeight) / 2);
        }

        const outWidth = Math.min(originalWidth, targetWidth);
        const outHeight = Math.round(outWidth / ratio);

        const canvas = document.createElement("canvas");
        canvas.width = outWidth;
        canvas.height = outHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(imageBlob);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
          img,
          srcX,
          srcY,
          srcWidth,
          srcHeight,
          0,
          0,
          outWidth,
          outHeight
        );

        canvas.toBlob(
          (croppedBlob) => {
            if (croppedBlob && croppedBlob.size > 0) {
              resolve(croppedBlob);
            } else {
              resolve(imageBlob);
            }
          },
          imageBlob.type || "image/jpeg",
          0.92
        );
      } catch (err) {
        console.error("Failed to crop image to 16:9:", err);
        resolve(imageBlob);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      console.error("Failed to load image for cropping:", err);
      resolve(imageBlob);
    };

    img.src = url;
  });
}


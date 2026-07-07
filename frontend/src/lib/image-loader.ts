interface ImageLoaderEnvironment {
  createImage: () => HTMLImageElement;
  createCanvas: () => HTMLCanvasElement;
}

const browserEnvironment: ImageLoaderEnvironment = {
  createImage: () => new Image(),
  createCanvas: () => document.createElement("canvas"),
};

export function loadImageData(
  source: string,
  environment: ImageLoaderEnvironment = browserEnvironment,
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const image = environment.createImage();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = environment.createCanvas();
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        reject(new Error("2D canvas is unavailable"));
        return;
      }
      context.drawImage(image, 0, 0);
      resolve(context.getImageData(0, 0, canvas.width, canvas.height));
    };
    image.onerror = () => reject(new Error(`Unable to load image: ${source}`));
    image.src = source;
  });
}

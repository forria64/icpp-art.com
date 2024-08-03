document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('imageForm');
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');

    // Resize canvas to match the framed image dimensions
    canvas.width = canvas.parentElement.clientWidth * 0.865; // Adjust according to CSS
    canvas.height = canvas.parentElement.clientHeight * 0.865; // Adjust according to CSS

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const number = parseInt(document.getElementById('artworkNumber').value);
        if (number < 1 || number > 2024) {
            alert('Number must be between 1 and 2024');
            return;
        }
        await generateImage(number);
    });

    async function generateImage(number) {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        try {
            // Fetch metadata
            const response = await fetch(`/metadata/${number}.json`);
            if (!response.ok) throw new Error('Metadata not found');
            const metadata = await response.json();

            // Load and color the background
            const backgroundImage = await loadImage(`/assets/background.png`);
            const coloredBackground = await colorBackground(backgroundImage, metadata.Background);
            ctx.drawImage(coloredBackground, 0, 0, canvas.width, canvas.height);

            // Load and color the body
            const bodyImage = await loadImage(`/assets/body-type/${metadata["Acrylic Scrap"].slice(1)}.png`);
            const coloredBody = await colorBody(bodyImage, metadata["Scrap Overlay"], metadata.Accent);
            ctx.drawImage(coloredBody, 0, 0, canvas.width, canvas.height);

            // Draw the outline
            const outlineImage = await loadImage('/assets/outline.png');
            ctx.drawImage(colorImage(outlineImage, metadata.Accent), 0, 0, canvas.width, canvas.height);

            // Draw the left eye
            const leftEyeImage = await loadImage(`/assets/left-eye-type/${metadata["Left Eye"].slice(1)}.png`);
            ctx.drawImage(colorImage(leftEyeImage, metadata.Accent), 0, 0, canvas.width, canvas.height);

            // Draw the right eye
            const rightEyeImage = await loadImage(`/assets/right-eye-type/${metadata["Right Eye"].slice(1)}.png`);
            ctx.drawImage(colorImage(rightEyeImage, metadata.Accent), 0, 0, canvas.width, canvas.height);

            // Draw the mouth
            const mouthImage = await loadImage(`/assets/mouth-type/${metadata.Mouth.slice(1)}.png`);
            ctx.drawImage(colorImage(mouthImage, metadata.Accent), 0, 0, canvas.width, canvas.height);

        } catch (error) {
            console.error('Error generating image:', error);
            alert('An error occurred while generating the artwork. Please try again.');
        }
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }
// OK FUNCTION FOR BACKGROUND
function colorBackground(image, overlayColor) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Desaturate the image
    tempCtx.drawImage(image, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, image.width, image.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = avg;
    }
    tempCtx.putImageData(imageData, 0, 0);

    // Apply the overlay color
    tempCtx.globalCompositeOperation = 'overlay';
    tempCtx.fillStyle = overlayColor;
    tempCtx.fillRect(0, 0, image.width, image.height);

    return tempCanvas;
    }


//BODY COLOR IMAGE IN WORK
function colorBody(image, overlayColor, accentColor) {
    // Create temporary canvases
    const bodyCanvas = document.createElement('canvas');
    const colorCanvas = document.createElement('canvas');
    const finalCanvas = document.createElement('canvas');
    const bodyCtx = bodyCanvas.getContext('2d');
    const colorCtx = colorCanvas.getContext('2d');
    const finalCtx = finalCanvas.getContext('2d');

    // Set dimensions for canvases
    bodyCanvas.width = colorCanvas.width = finalCanvas.width = image.width;
    bodyCanvas.height = colorCanvas.height = finalCanvas.height = image.height;

    // Step 1: Draw and desaturate the body image on bodyCanvas
    bodyCtx.drawImage(image, 0, 0);
    const bodyImageData = bodyCtx.getImageData(0, 0, bodyCanvas.width, bodyCanvas.height);
    const bodyData = bodyImageData.data;

    // Convert to grayscale
    for (let i = 0; i < bodyData.length; i += 4) {
        const r = bodyData[i];
        const g = bodyData[i + 1];
        const b = bodyData[i + 2];
        // Calculate grayscale value
        const gray = 0.3 * r + 0.59 * g + 0.11 * b;
        bodyData[i] = bodyData[i + 1] = bodyData[i + 2] = gray;
    }
    bodyCtx.putImageData(bodyImageData, 0, 0);

    // Step 2: Apply sharpening (contrast) to the desaturated image
    finalCtx.drawImage(bodyCanvas, 0, 0);
    finalCtx.filter = 'contrast(1.4)';
    finalCtx.drawImage(finalCanvas, 0, 0);
    finalCtx.filter = 'none'; // Reset filter

    // Step 3: Apply the color overlay
    colorCtx.drawImage(finalCanvas, 0, 0); // Draw sharpened body on colorCanvas
    colorCtx.globalCompositeOperation = 'source-atop';
    colorCtx.fillStyle = overlayColor;
    colorCtx.fillRect(0, 0, colorCanvas.width, colorCanvas.height);
    colorCtx.globalCompositeOperation = 'source-over'; // Reset to default

    // Step 4: Adjust brightness based on accent color
    const brightnessAdjustment = (accentColor === "#ffffff") ? 0.7 : (accentColor === "#000000") ? 1.6 : 1.0;
    finalCtx.drawImage(colorCanvas, 0, 0);
    finalCtx.filter = `brightness(${brightnessAdjustment})`;
    finalCtx.drawImage(finalCanvas, 0, 0);
    finalCtx.filter = 'none'; // Reset filter

    // Return the final canvas with the body image
    return finalCanvas;
}



// ASSET COLOR FUNCTION IN WORK
    function colorImage(image, color) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw the original image
        tempCtx.drawImage(image, 0, 0);

        // Apply a color overlay
        tempCtx.globalCompositeOperation = 'source-atop';
        tempCtx.fillStyle = color;
        tempCtx.fillRect(0, 0, image.width, image.height);

        // Reset composition operation
        tempCtx.globalCompositeOperation = 'source-over';

        return tempCanvas;
    }
});


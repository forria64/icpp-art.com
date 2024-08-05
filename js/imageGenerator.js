document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('imageForm');
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    const inputField = document.getElementById('artworkNumber');
    const slides = document.querySelectorAll('.slide');
    const loadingMessage = document.getElementById('loadingMessage');
    const traitsTicker = document.getElementById('traitsTicker');
    const traitsText = document.getElementById('traitsText');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');

    // Resize canvas to match the framed image dimensions
    canvas.width = canvas.parentElement.clientWidth * 0.865; // Adjust according to CSS
    canvas.height = canvas.parentElement.clientHeight * 0.865; // Adjust according to CSS

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const number = parseInt(inputField.value);
        if (number < 1 || number > 2024) {
            alert('Number must be between 1 and 2024');
            return;
        }
        await generateImage(number);
    });

    leftArrow.addEventListener('click', () => {
        let currentNumber = parseInt(inputField.value);
        if (currentNumber > 1) {
            setInputValueAndGenerateImage(currentNumber - 1);
        }
    });

    rightArrow.addEventListener('click', () => {
        let currentNumber = parseInt(inputField.value);
        if (currentNumber < 2024) {
            setInputValueAndGenerateImage(currentNumber + 1);
        }
    });

    function setInputValueAndGenerateImage(number) {
        inputField.value = number; // Set the input field to the provided number
        generateImage(number); // Generate the image for the provided number
    }

    async function generateImage(number) {
        // Show loading message and hide traits ticker
        loadingMessage.style.display = 'block';
        traitsTicker.style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        console.log("Loading artwork for number:", number);

        try {
            // Fetch metadata
            const response = await fetch(`/metadata/${number}.json`);
            if (!response.ok) throw new Error('Metadata not found');
            const metadata = await response.json();

            console.log("Metadata fetched:", metadata);

            // Load all images in parallel
            const [
                backgroundImage,
                bodyImage,
                outlineImage,
                leftEyeImage,
                rightEyeImage,
                mouthImage
            ] = await Promise.all([
                loadImage(`/assets/background.png`),
                loadImage(`/assets/body-type/${metadata["Acrylic Scrap"].slice(1)}.png`),
                loadImage('/assets/outline.png'),
                loadImage(`/assets/left-eye-type/${metadata["Left Eye"].slice(1)}.png`),
                loadImage(`/assets/right-eye-type/${metadata["Right Eye"].slice(1)}.png`),
                loadImage(`/assets/mouth-type/${metadata.Mouth.slice(1)}.png`)
            ]);

            console.log("All images loaded successfully");

            // Apply color transformations and draw images on canvas
            ctx.drawImage(colorBackground(backgroundImage, metadata.Background), 0, 0, canvas.width, canvas.height);
            ctx.drawImage(colorBody(bodyImage, metadata["Scrap Overlay"], metadata.Accent), 0, 0, canvas.width, canvas.height);
            ctx.drawImage(colorImage(outlineImage, metadata.Accent), 0, 0, canvas.width, canvas.height);
            ctx.drawImage(colorImage(leftEyeImage, metadata.Accent), 0, 0, canvas.width, canvas.height);
            ctx.drawImage(colorImage(rightEyeImage, metadata.Accent), 0, 0, canvas.width, canvas.height);
            ctx.drawImage(colorImage(mouthImage, metadata.Accent), 0, 0, canvas.width, canvas.height);

            console.log("Image drawn on canvas");

            // Once the image is generated, hide the loading message and show the traits ticker
            loadingMessage.style.display = 'none';

            // Create ticker content with white text for accent colors
            const traitsContent = `
                Background: <span style="color:${metadata.Background}">${metadata.Background}</span> ||| 
                Scrap Overlay: <span style="color:${metadata["Scrap Overlay"]}">${metadata["Scrap Overlay"]}</span> ||| 
                Accent: <span style="color:white">${metadata.Accent}</span> ||| 
                Left Eye: <span style="color:white">${metadata["Left Eye"]}</span> ||| 
                Right Eye: <span style="color:white">${metadata["Right Eye"]}</span> ||| 
                Mouth: <span style="color:white">${metadata.Mouth}</span> ||| 
            `;
            traitsText.innerHTML = traitsContent.repeat(100); // Repeat the content to ensure continuous scrolling
            traitsTicker.style.display = 'block';

            console.log("Traits ticker updated and displayed");

        } catch (error) {
            console.error('Error generating image:', error);
            alert('An error occurred while generating the artwork. Please try again.');
            loadingMessage.style.display = 'none'; // Hide loading message on error
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

    function colorBody(image, overlayColor, accentColor) {
        const bodyCanvas = document.createElement('canvas');
        const finalCanvas = document.createElement('canvas');
        const bodyCtx = bodyCanvas.getContext('2d');
        const finalCtx = finalCanvas.getContext('2d');

        // Set dimensions for canvases
        bodyCanvas.width = finalCanvas.width = image.width;
        bodyCanvas.height = finalCanvas.height = image.height;

        // Draw and desaturate the body image
        bodyCtx.drawImage(image, 0, 0);
        const bodyImageData = bodyCtx.getImageData(0, 0, bodyCanvas.width, bodyCanvas.height);
        const bodyData = bodyImageData.data;
        for (let i = 0; i < bodyData.length; i += 4) {
            const r = bodyData[i];
            const g = bodyData[i + 1];
            const b = bodyData[i + 2];
            const alpha = bodyData[i + 3];

            if (alpha > 0) {
                const gray = 0.3 * r + 0.59 * g + 0.11 * b;
                bodyData[i] = bodyData[i + 1] = bodyData[i + 2] = gray;
            }
        }
        bodyCtx.putImageData(bodyImageData, 0, 0);

        // Apply sharpening (contrast) to the desaturated image
        finalCtx.drawImage(bodyCanvas, 0, 0);
        finalCtx.filter = 'contrast(1.4)';
        finalCtx.drawImage(finalCanvas, 0, 0);
        finalCtx.filter = 'none';

        // Apply the color overlay only on non-transparent areas
        const coloredImageData = finalCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);
        const coloredData = coloredImageData.data;
        for (let i = 0; i < coloredData.length; i += 4) {
            const alpha = coloredData[i + 3];
            if (alpha > 0) {
                coloredData[i] = (coloredData[i] + parseInt(overlayColor.slice(1, 3), 16)) / 2;
                coloredData[i + 1] = (coloredData[i + 1] + parseInt(overlayColor.slice(3, 5), 16)) / 2;
                coloredData[i + 2] = (coloredData[i + 2] + parseInt(overlayColor.slice(5, 7), 16)) / 2;
            }
        }
        finalCtx.putImageData(coloredImageData, 0, 0);

        // Adjust brightness based on accent color
        const brightnessAdjustment = (accentColor === "#ffffff") ? 0.7 : (accentColor === "#000000") ? 1.6 : 1.0;
        finalCtx.filter = `brightness(${brightnessAdjustment})`;
        finalCtx.drawImage(finalCanvas, 0, 0);
        finalCtx.filter = 'none';

        return finalCanvas;
    }

    function colorImage(image, color) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.drawImage(image, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        const colorCanvas = document.createElement('canvas');
        colorCanvas.width = image.width;
        colorCanvas.height = image.height;
        const colorCtx = colorCanvas.getContext('2d');

        colorCtx.fillStyle = color;
        colorCtx.fillRect(0, 0, colorCanvas.width, colorCanvas.height);

        const colorData = colorCtx.getImageData(0, 0, colorCanvas.width, colorCanvas.height).data;

        for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha > 0) {
                data[i] = colorData[i];
                data[i + 1] = colorData[i + 1];
                data[i + 2] = colorData[i + 2];
            }
        }

        tempCtx.putImageData(imageData, 0, 0);

        return tempCanvas;
    }

    function onSlideLoad(slideIndex) {
        // Set the input value to "1" and generate the image
        setInputValueAndGenerateImage(2024);
    }

    // Add event listeners for slide changes
    slides.forEach((slide, index) => {
        slide.addEventListener('transitionend', () => {
            if (slide.classList.contains('active')) {
                onSlideLoad(index);
            }
        });
    });

    // Initialize the first slide
    if (slides.length > 0 && slides[0].classList.contains('active')) {
        onSlideLoad(0);
    }
});


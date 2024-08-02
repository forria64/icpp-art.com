document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('imageForm');
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');

    // Resize canvas to match the framed image dimensions
    canvas.width = canvas.parentElement.clientWidth * 0.865; // Adjust according to CSS
    canvas.height = canvas.parentElement.clientHeight * 0.865; // Adjust according to CSS

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const number = parseInt(document.getElementById('artworkNumber').value);
        if (number < 1 || number > 2024) {
            alert('Number must be between 1 and 2024');
            return;
        }
        generateImage(number);
    });

    function generateImage(number) {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Example: Draw a colored background and the number
        const color = `#${Math.floor(Math.random()*16777215).toString(16)}`; // Random color
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#000000'; // Text color
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Artwork #${number}`, canvas.width / 2, canvas.height / 2);

        // Further customization to replicate your image generation logic goes here
    }
});


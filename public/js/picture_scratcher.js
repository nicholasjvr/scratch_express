const createScratchCard = () => {
    let canvas = document.getElementById("scratch-canvas");
    let context = canvas.getContext("2d", { willReadFrequently: true });
    let topImage = new Image();
    let bottomImage = new Image();
    let scratchRadius = 25;
    let isDragging = false;

    // Set the source for images
    bottomImage.src = 'img/you_win.png';
    topImage.src = 'img/scratch_here.png';

    // Draw the bottom image first
    const drawBottomImage = () => {
        context.globalCompositeOperation = "source-over";
        context.drawImage(bottomImage, 0, 0, canvas.width, canvas.height);
    };

    // Draw the top image on top of the bottom image
    const drawTopImage = () => {
        context.globalCompositeOperation = "source-over";
        context.drawImage(topImage, 0, 0, canvas.width, canvas.height);
    };

    // Handle the scratch effect
    const scratch = (x, y) => {
        // Adjust coordinates to be relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const canvasX = x - rect.left;
        const canvasY = y - rect.top;

        context.globalCompositeOperation = "destination-out";
        context.beginPath();
        context.arc(canvasX, canvasY, scratchRadius, 0, 2 * Math.PI);
        context.fill();
    };

    // Event listeners for mouse and touch events
    const handlePointerMove = (event) => {
        event.preventDefault();
        if (isDragging) {
            scratch(event.clientX || event.touches[0].clientX, event.clientY || event.touches[0].clientY);
        }
    };

    canvas.addEventListener("mousedown", (event) => {
        event.preventDefault();
        isDragging = true;
        scratch(event.clientX, event.clientY);
    });

    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("mouseup", (event) => {
        event.preventDefault();
        isDragging = false;
    });

    canvas.addEventListener("mouseleave", (event) => {
        event.preventDefault();
        isDragging = false;
    });

    canvas.addEventListener("touchstart", (event) => {
        event.preventDefault();
        isDragging = true;
        const touch = event.touches[0];
        scratch(touch.clientX, touch.clientY);
    });

    canvas.addEventListener("touchmove", handlePointerMove);
    canvas.addEventListener("touchend", (event) => {
        event.preventDefault();
        isDragging = false;
    });

    // Initialize the scratch card
    const initializeScratchCard = async () => {
        bottomImage.onload = () => {
            console.log('Bottom image loaded.');

            topImage.onload = () => {
                console.log('Top image loaded.');
                drawBottomImage();
                drawTopImage();
                document.querySelector('.bottom-image-container').classList.add('show');
            };

            topImage.onerror = (error) => {
                console.error('Error loading top image:', error);
            };
        };

        bottomImage.onerror = (error) => {
            console.error('Error loading bottom image:', error);
        };
    };

    // Adjust canvas size on resize
    window.addEventListener('resize', () => {
        const portrait = window.matchMedia("(orientation: portrait)").matches;
        canvas.width = portrait ? 200 : 250; // Adjust width as needed
        canvas.height = portrait ? 450 : 500; // Adjust height as needed
        drawBottomImage();
        drawTopImage();
    });

    initializeScratchCard();
};

document.addEventListener('DOMContentLoaded', () => {
    createScratchCard();
});

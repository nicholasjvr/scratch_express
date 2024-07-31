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

    // Calculate the percentage of scratched area
    const calculateScratchedPercentage = () => {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        let totalPixels = imageData.width * imageData.height;
        let scratchedPixels = 0;

        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] === 0) { // alpha channel
                scratchedPixels++;
            }
        }

        return (scratchedPixels / totalPixels) * 100;
    };

    // Event listeners for mouse and touch events
    const handlePointerMove = (event) => {
        event.preventDefault(); // Prevent default action
        if (isDragging) {
            scratch(event.clientX, event.clientY);
        }
    };

    canvas.addEventListener("mousedown", (event) => {
        event.preventDefault(); // Prevent default action
        isDragging = true;
        scratch(event.clientX, event.clientY);
    });

    canvas.addEventListener("mousemove", handlePointerMove);

    canvas.addEventListener("mouseup", (event) => {
        event.preventDefault(); // Prevent default action
        isDragging = false;
    });

    canvas.addEventListener("mouseleave", (event) => {
        event.preventDefault(); // Prevent default action
        isDragging = false;
    });

    canvas.addEventListener("touchstart", (event) => {
        event.preventDefault(); // Prevent default action
        isDragging = true;
        const touch = event.touches[0];
        scratch(touch.clientX, touch.clientY);
    });

    canvas.addEventListener("touchmove", (event) => {
        event.preventDefault(); // Prevent default action
        if (isDragging) {
            const touch = event.touches[0];
            scratch(touch.clientX, touch.clientY);
        }
    });

    canvas.addEventListener("touchend", (event) => {
        event.preventDefault(); // Prevent default action
        isDragging = false;
    });

    // Initialize the scratch card
    const initializeScratchCard = async () => {
        bottomImage.onload = () => {
            console.log('Bottom image loaded.');
            drawBottomImage(); // Draw bottom image first

            topImage.onload = () => {
                console.log('Top image loaded.');
                drawTopImage(); // Draw top image last
                document.querySelector('.bottom-image-container').classList.add('show'); // Show the bottom image container
                requestAnimationFrame(checkScratchedPercentage);
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
        canvas.width = window.innerWidth * 0.9; // Adjust size as needed
        canvas.height = window.innerHeight * 0.6; // Adjust size as needed
        bottomImage.src = 'img/you_win.png';
        topImage.src = 'img/scratch_here.png';
    });

    initializeScratchCard();
};

document.addEventListener('DOMContentLoaded', () => {
    createScratchCard();
});

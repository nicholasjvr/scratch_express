const createScratchCard = () => {
    let canvas = document.getElementById("scratch-canvas");
    let context = canvas.getContext("2d", { willReadFrequently: true });
    let topImage = new Image();
    let bottomImage = new Image();
    let hasScratchedImg = new Image();
    let hasEnteredImg = new Image();
    let scratchRadius = 30;
    let isDragging = false;

    // Set the source for images
    bottomImage.src = 'img/you_win.png';
    topImage.src = 'img/scratch_here.png';
    hasScratchedImg.src = 'img/ThankYou.png';
    hasEnteredImg.src = 'img/YouHaveEntered.png';

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawBottomImage();
        drawTopImage();
    };

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

    const drawHasScratchedImage = () => {
        context.globalCompositeOperation = "source-over";
        context.drawImage(hasScratchedImg, 0, 0, canvas.width, canvas.height);
    };

    const drawHasEnteredImage = () => {
        let hasEnteredImageElement = document.createElement('img');
        hasEnteredImageElement.src = 'img/YouHaveEntered.png';
        hasEnteredImageElement.id = 'hasEnteredImg'; // Assign an ID for styling
        hasEnteredImageElement.style.position = 'absolute'; // Position it absolutely
        hasEnteredImageElement.style.top = '0'; // Adjust as needed
        hasEnteredImageElement.style.left = '0'; // Adjust as needed
        hasEnteredImageElement.style.width = '100%'; // Adjust as needed
        hasEnteredImageElement.style.height = '100%'; // Adjust as needed
        hasEnteredImageElement.style.pointerEvents = 'none'; // Make it non-interactive
        document.body.appendChild(hasEnteredImageElement);
    };

    // Handle the scratch effect
    const scratch = (x, y) => {
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

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    const leadId = getUrlParameter('id');
    console.log('URL parameter prize:', leadId);

    const checkLeadStatus = async (leadId) => {
        const url = `https://scratch.dsltelecom.co.za/status/${leadId}`;

        try {
            const response = await fetch(url, { method: 'GET' });

            if (!response.ok) {
                throw new Error('HTTP error! status: ${response.status}');
            }
            const data = await response.json();
            console.log("CHECK LEAD STATUS RESPONSE", data.hasScratched);
            return data.hasScratched;
        } catch (error) {
            console.error("Error checking lead status:", error);
            return null;
        }
    };

    const updateLeadStatus = async (leadId) => {
        const url = `https://scratch.dsltelecom.co.za/status/${leadId}`;

        try {
            const response = await fetch(url, { method: 'POST' });

            if (!response.ok) {
                throw new Error('HTTP error! status: ${response.status}');
            }
            const data = await response.json();
            console.log("Update data status", data);
        } catch (error) {
            console.error("Error updating lead status:", error);
        }
    };

    const checkScratchedPercentage = () => {
        const percentage = calculateScratchedPercentage();
        if (percentage > 85) {
            drawHasScratchedImage();
            updateLeadStatus(leadId);
        } else {
            requestAnimationFrame(checkScratchedPercentage);
        }
    };

    // Initialize the scratch card
    const initializeScratchCard = async () => {
        const bottomImageLoaded = new Promise((resolve, reject) => {
            bottomImage.onload = () => {
                console.log('Bottom image loaded.');
                resolve();
            };
            bottomImage.onerror = (error) => {
                console.error('Error loading bottom image:', error);
                reject(error);
            };
        });

        const topImageLoaded = new Promise((resolve, reject) => {
            topImage.onload = () => {
                console.log('Top image loaded.');
                resolve();
            };
            topImage.onerror = (error) => {
                console.error('Error loading top image:', error);
                reject(error);
            };
        });

        try {
            await Promise.all([bottomImageLoaded, topImageLoaded]);
            resizeCanvas();
            document.querySelector('.bottom-image-container').classList.add('show');
            requestAnimationFrame(checkScratchedPercentage);
            const hasScratched = await checkLeadStatus(leadId);
            console.log("HAS SCRATCHED", hasScratched);
            if (hasScratched === 'true') {
                drawHasEnteredImage();
                return;
            }
        } catch (error) {
            console.error('Error initializing scratch card:', error);
        }
    };

    window.addEventListener('resize', resizeCanvas);
    initializeScratchCard();

    document.body.addEventListener('touchmove', (event) => {
        event.preventDefault();
    }, { passive: false });
};

document.addEventListener('DOMContentLoaded', createScratchCard);

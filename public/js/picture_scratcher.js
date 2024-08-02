const createScratchCard = () => {
    let canvas = document.getElementById("scratch-canvas");
    let context = canvas.getContext("2d", { willReadFrequently: true });
    let topImage = new Image();
    let bottomImage = new Image();
    let hasScratchedImg = new Image();
    let hasEnteredImg = new Image();
    let scratchRadius = 50;
    let isDragging = false;
    let hasScratched = false;
    let scratchingAllowed = true; // Variable to control scratching
    const logoContainer = document.querySelector('.logo-container');

    // Function to get image based on screen size
    const getImageBasedOnScreenSize = (desktopImage, tabletImage, mobileImage) => {
        const screenWidth = window.innerWidth;

        if (screenWidth >= 1080) {
            return desktopImage;
        } else if (screenWidth >= 800 && screenWidth < 1080) {
            return tabletImage;
        } else if (screenWidth) {
            return mobileImage;
        }
    };

    // Set the source for images
    bottomImage.src = getImageBasedOnScreenSize('img/desktop_bottom.png', 'img/tablet_bottom.png', 'img/mobile_bottom.png');
    topImage.src = getImageBasedOnScreenSize('img/scratch_here_desktop.png', 'img/scratch_here_mobile.png', 'img/scratch_here_mobile.png');
    hasScratchedImg.src = getImageBasedOnScreenSize('img/thank_you_entry_desktop.png', 'img/thank_you_entry_mobile.png', 'img/thank_you_entry_mobile.png');
    hasEnteredImg.src = getImageBasedOnScreenSize('img/already_entered_desktop.png', 'img/already_entered_mobile.png', 'img/already_entered_mobile.png');

    const handleImageError = (imageName) => (error) => {
        console.error(`Error loading ${imageName}:`, error);
    };

    const loadImage = (image, name) => new Promise((resolve, reject) => {
        image.onload = () => {
            console.log(`${name} loaded.`);
            resolve();
        };
        image.onerror = handleImageError(name);
    });

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawBottomImage();
        drawTopImage();
    };

    // Draw the bottom image first
    const drawBottomImage = () => {
        context.globalCompositeOperation = "source-over";
        if (bottomImage.complete && bottomImage.naturalHeight !== 0) {
            context.drawImage(bottomImage, 0, 0, canvas.width, canvas.height);
        } else {
            console.error('Bottom image not loaded or broken');
        }
    };

    // Draw the top image on top of the bottom image
    const drawTopImage = () => {
        context.globalCompositeOperation = "source-over";
        if (topImage.complete && topImage.naturalHeight !== 0) {
            context.drawImage(topImage, 0, 0, canvas.width, canvas.height);
        } else {
            console.error('Top image not loaded or broken');
        }
    };

    const drawHasScratchedImage = () => {
        context.globalCompositeOperation = "source-over";
        if (hasScratchedImg.complete && hasScratchedImg.naturalHeight !== 0) {
            context.drawImage(hasScratchedImg, 0, 0, canvas.width, canvas.height);
        } else {
            console.error('Has Scratched image not loaded or broken');
        }
    };

    const drawHasEnteredImage = () => {
        let hasEnteredImageElement = document.createElement('img');
        hasEnteredImageElement.src = hasEnteredImg.src;
        hasEnteredImageElement.id = 'hasEnteredImg';
        hasEnteredImageElement.style.position = 'absolute'; 
        hasEnteredImageElement.style.top = '0'; 
        hasEnteredImageElement.style.left = '0';
        hasEnteredImageElement.style.width = '100%'; 
        hasEnteredImageElement.style.height = '100%'; 
        hasEnteredImageElement.style.pointerEvents = 'none'; 
        document.body.appendChild(hasEnteredImageElement);
    };

    // Handle the scratch effect
    const scratch = (x, y) => {
        if (!scratchingAllowed) return; // Prevent scratching if not allowed
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
            if (event.touches && event.touches.length > 0) {
                // Touch event
                scratch(event.touches[0].clientX, event.touches[0].clientY);
            } else {
                // Mouse event
                scratch(event.clientX, event.clientY);
            }
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
                throw new Error(`HTTP error! status: ${response.status}`);
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
        const baseURL = `${window.location.protocol}//${window.location.host}`;
        console.log("baseURL" + baseURL);
        const url = `https://scratch.dsltelecom.co.za/status/${leadId}`;

        try {
            const response = await fetch(url, { method: 'POST' });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Update data status", data);
        } catch (error) {
            console.error("Error updating lead status:", error);
        }
    };

    const checkScratchedPercentage = () => {
        const percentage = calculateScratchedPercentage();
        //console.log("percentage" + percentage);
        if (hasScratched === 'true') {
            drawHasEnteredImage();
            return;
        }
        if (percentage > 60) {
            updateLeadStatus(leadId);
            setTimeout(() => {
                drawHasScratchedImage();
                scratchingAllowed = false; // Disable scratching
                setTimeout(() => {
                    scratchingAllowed = true; // Re-enable scratching after 1 second
                }, 1000);
            }, 8000);
        } else {
            requestAnimationFrame(checkScratchedPercentage);
        }
    };

    // Initialize the scratch card
    const initializeScratchCard = async () => {
        try {
            await Promise.all([
                loadImage(bottomImage, 'bottom image'),
                loadImage(topImage, 'top image'),
                loadImage(hasEnteredImg, 'has entered image')
            ]);
            resizeCanvas();
            document.querySelector('.bottom-image-container').classList.add('show');
            hasScratched = await checkLeadStatus(leadId);
            console.log("Lead has scratched:", hasScratched);
            if (hasScratched === 'true') {
                drawHasEnteredImage();
            }
            requestAnimationFrame(checkScratchedPercentage);
        } catch (error) {
            console.error('Error initializing scratch card:', error);
        }
    };

    // Resize canvas when the window is resized
    window.addEventListener("resize", resizeCanvas);

    initializeScratchCard();
};

window.onload = createScratchCard;
window.addEventListener('orientationchange', function ()
{
    if (window.innerHeight > window.innerWidth)
    {
        document.getElementsByTagName('body')[0].style.transform = "rotate(90deg)";
    }
});

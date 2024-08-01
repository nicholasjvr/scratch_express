const createScratchCard = () => {
    let canvas = document.getElementById("scratch-canvas");
    let context = canvas.getContext("2d", { willReadFrequently: true });
    let topImage = new Image();
    let bottomImage = new Image();
    let hasScratchedImg = new Image();
    let hasEnteredImg = new Image();
    let scratchRadius = 30;
    let isDragging = false;

    bottomImage.src = 'img/you_win.png';
    topImage.src = 'img/scratch_here.png';
    hasScratchedImg.src = 'img/ThankYou.png';
    hasEnteredImg.src = 'img/YouHaveEntered.png';

    let hasEnteredImgPosition = { x: 0, y: 0, width: 0, height: 0 };

    const drawBottomImage = () => {
        context.globalCompositeOperation = "source-over";
        context.drawImage(bottomImage, 0, 0, canvas.width, canvas.height);
    };

    const drawTopImage = () => {
        context.globalCompositeOperation = "source-over";
        context.drawImage(topImage, 0, 0, canvas.width, canvas.height);
    };

    const drawHasScratchedImage = () => {
        context.globalCompositeOperation = "source-over";
        context.drawImage(hasScratchedImg, 0, 0, canvas.width, canvas.height);
    };

    const drawHasEnteredImage = () => {
        context.globalCompositeOperation = "source-over";
        context.drawImage(hasEnteredImg, 0, 0, canvas.width, canvas.height);

        hasEnteredImgPosition = {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height
        };
    };

    const scratch = (x, y) => {
        const rect = canvas.getBoundingClientRect();
        const canvasX = x - rect.left;
        const canvasY = y - rect.top;

        const withinHasEnteredImg = (
            canvasX >= hasEnteredImgPosition.x &&
            canvasX <= hasEnteredImgPosition.x + hasEnteredImgPosition.width &&
            canvasY >= hasEnteredImgPosition.y &&
            canvasY <= hasEnteredImgPosition.y + hasEnteredImgPosition.height
        );

        if (!withinHasEnteredImg) {
            context.globalCompositeOperation = "destination-out";
            context.beginPath();
            context.arc(canvasX, canvasY, scratchRadius, 0, 2 * Math.PI);
            context.fill();
        }
    };

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
            if (imageData.data[i + 3] === 0) {
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
        if (percentage > 85) {
            drawBottomImage();
            updateLeadStatus(leadId);
        }
    };

    const initialize = async () => {
        const leadStatus = await checkLeadStatus(leadId);
        if (leadStatus === false) {
            drawTopImage();
            drawHasEnteredImage();
            setInterval(checkScratchedPercentage, 1000);
        } else {
            drawHasScratchedImage();
        }
    };

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawTopImage();
        drawHasEnteredImage();
    });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    initialize();
};

createScratchCard();

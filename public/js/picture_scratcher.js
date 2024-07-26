
const createScratchCard = (canvasId) => {
    let canvas = document.getElementById(canvasId).querySelector("canvas");
    let context = canvas.getContext("2d");
    let topImage = new Image();
    let scratchRadius = 25;
    let isDragging = false;

    const bottomImages = [
        'img/YouWin.png',
    ];

    const getRandomImage = () => {
        const randomIndex = Math.floor(Math.random() * bottomImages.length);
        return bottomImages[randomIndex];
    };

    const randomBottomImageSrc = getRandomImage();
    document.getElementById("bottom-image").src = randomBottomImageSrc;

    const drawTopImage = () => {
        context.globalCompositeOperation = "source-over";
        context.drawImage(topImage, 0, 0, canvas.width, canvas.height);
    };

    const scratch = (x, y) => {
        const rect = canvas.getBoundingClientRect();
        x = x - rect.left;
        y = y - rect.top;

        context.globalCompositeOperation = "destination-out";
        context.beginPath();
        context.arc(x, y, scratchRadius, 0, 2 * Math.PI);
        context.fill();
    };

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


    //!!!!!!!!!!!!!!!!!!
    const checkLeadStatus = async (leadId) => {
        const url = `http://localhost:8000/status/${leadId}`;
    
        try {
            const response = await fetch(url, { method: 'GET' });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // Assuming the response is JSON
            console.log("CHECK LEAD STATUS RESPONSE", data.hasScratched);
            return data.hasScratched;
        } catch (error) {
            console.error("Error checking lead status:", error);
            return null; // Return null or handle the error as needed
        }
    };
    

    //!!!!!!!!!!!!!!!
    const updateLeadStatus = async (leadId) => {
        console.log(leadId);
        const url = `http://localhost:8000/status/${leadId}`;
    
        try {
            const response = await fetch(url, { method: 'POST' });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // Assuming the response is JSON
            console.log("Update data status", data)
        } catch (error) {
            console.error("Error checking lead status:", error);
        }
    };

    const checkScratchedPercentage = () => {
        const percentage = calculateScratchedPercentage();
        if (percentage > 50) {
            alert(`Lead ID ${leadId} has scratched more than 50% of the card!`);

            updateLeadStatus(leadId);//!!!!!!!!!!!!!
        } else {
            requestAnimationFrame(checkScratchedPercentage);
        }
    };

    const initializeScratchCard = async () => {
        const hasScratched = await checkLeadStatus(leadId);//!!!!!!!!!!!!!!
        console.log("HAS SCRATCHED" + hasScratched);//!!!!!!!!!!!!!!!!!!
        if (hasScratched === 'true') {
            alert('You have already scratched the card.');
            return;
        }

        canvas.addEventListener("mousedown", (event) => {
            isDragging = true;
            scratch(event.clientX, event.clientY);
        });

        canvas.addEventListener("mousemove", (event) => {
            if (isDragging) {
                scratch(event.clientX, event.clientY);
            }
        });

        canvas.addEventListener("mouseup", () => {
            isDragging = false;
        });

        canvas.addEventListener("mouseleave", () => {
            isDragging = false;
        });

        topImage.onload = () => {
            drawTopImage();
            requestAnimationFrame(checkScratchedPercentage);
        };
        topImage.src = 'img/scratch.png';

        console.log('Top image source:', topImage.src);
        console.log('Random bottom image source:', randomBottomImageSrc);
    };

    initializeScratchCard();
};

createScratchCard("scratch_card");
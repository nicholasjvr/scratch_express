const createScratchCard = () => {
    let canvas = document.getElementById("scratch-canvas");
    let context = canvas.getContext("2d");
    let topImage = new Image();
    let bottomImage = new Image();
    let scratchRadius = 25;
    let isDragging = false;

    // Set the source for bottom image
    const setBottomImage = () => {
        bottomImage.src = 'public/img/win.png';
    };

    // Draw the top image on the canvas
    const drawTopImage = () => {
        console.log('Drawing top image...');
        context.globalCompositeOperation = "source-over";
        context.drawImage(topImage, 0, 0, canvas.width, canvas.height);
    };

    // Handle the scratch effect
    const scratch = (x, y) => {
        const rect = canvas.getBoundingClientRect();
        x = x - rect.left;
        y = y - rect.top;

        context.globalCompositeOperation = "destination-out";
        context.beginPath();
        context.arc(x, y, scratchRadius, 0, 2 * Math.PI);
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

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    const leadId = getUrlParameter('id');
    console.log('URL parameter prize:', leadId);

    const checkLeadStatus = async (leadId) => {
        const url = `http://localhost:8000/status/${leadId}`;

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
        console.log(leadId);
        const url = `http://localhost:8000/status/${leadId}`;

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
        if (percentage > 50) {
            document.getElementById('claim-button').style.display = 'block'; // Show the button
            alert(`Lead ID ${leadId} has scratched more than 50% of the card!`);
            updateLeadStatus(leadId);
        } else {
            requestAnimationFrame(checkScratchedPercentage);
        }
    };

    const initializeScratchCard = async () => {
        const hasScratched = await checkLeadStatus(leadId);
        console.log("HAS SCRATCHED", hasScratched);
        if (hasScratched === 'true') {
            alert('You have already scratched the card.');
            return;
        }

        // Load bottom image first
        bottomImage.onload = () => {
            console.log('Bottom image loaded.');
            context.drawImage(bottomImage, 0, 0, canvas.width, canvas.height);
            console.log('Bottom image drawn.');

            // Now load the top image
            topImage.onload = () => {
                drawTopImage();
                requestAnimationFrame(checkScratchedPercentage);
                console.log('Top image loaded and drawn.');
            };

            topImage.onerror = (error) => {
                console.error('Error loading top image:', error);
            };

            topImage.src = "img/scratch_port.png";
        };

        bottomImage.onerror = (error) => {
            console.error('Error loading bottom image:', error);
        };

        setBottomImage();

        // Event listeners for mouse and touch events
        canvas.addEventListener("mousedown", (event) => {
            event.preventDefault(); // Prevent default action
            isDragging = true;
            scratch(event.clientX, event.clientY);
        });

        canvas.addEventListener("mousemove", (event) => {
            event.preventDefault(); // Prevent default action
            if (isDragging) {
                scratch(event.clientX, event.clientY);
            }
        });

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

        console.log('Top image source:', topImage.src);
    };

    window.addEventListener('resize', () => {
        setBottomImage();
        topImage.src = 'img/scratch_port.png';
    });

    initializeScratchCard();
};

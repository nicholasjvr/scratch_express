let accessToken = "1000.6a704eb7fde1f9a6aeaa12d989a0abd1.47bbe8df0777405faa008ba40c27c692"; // Replace with your initial access token
const refreshToken = "1000.500ceb92badc8a2c9ddb04f38d2d9738.5ea7af8e25020e3af0880a7754bd8a25"; // Replace with your refresh token

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

    const getNewAccessToken = async (refreshToken) => {
        const url = "https://localhost:8000/token";
        const clientId = "1000.YJ99QF288RQVHN4THYB5V5KU5RA71A"; // Replace with your client ID
        const clientSecret = "4ae6844763df9f498aacc45e593732d5dc70922d10"; // Replace with your client secret

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    refresh_token: refreshToken,
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'refresh_token'
                })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            accessToken = data.access_token; // Update the global access token variable
            return accessToken;
        } catch (error) {
            console.error('Error refreshing access token:', error);
            return null;
        }
    };

    const checkLeadStatus = (leadId) => {
        const url = `http://localhost:8000/status/${leadId}`;

        // fetch('http://localhost:8000/status')
        // .then(response => response.json())
        // .then(usersList => {
        //   console.log(usersList);
        //   // Write an action that you want you want to perform with the response
        // })
        // .catch(error => {
        //   console.log(error);
        //   // Handle the error in case the request is not successfull
        // });

        fetch(url, {
            method: 'GET',
        })
        .then(
            response=>{
                console.log(response);
            }
        )
    };

    const updateLeadStatus = async (leadId) => {
        const url = `http://www.zohoapis.com/crm/v3/Leads/${leadId}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Zoho-oauthtoken ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: [
                        {
                            hasScratched: true
                        }
                    ]
                })
            });

            if (response.code === "INVALID_TOKEN") { // Token expired
                const newAccessToken = await getNewAccessToken(refreshToken);
                if (newAccessToken) {
                    // Retry with new access token
                    return updateLeadStatus(leadId);
                } else {
                    throw new Error('Failed to refresh access token');
                }
            }

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('CRM update response:', data);
        } catch (error) {
            console.error('Error updating CRM:', error);
        }
    };

    const checkScratchedPercentage = () => {
        const percentage = calculateScratchedPercentage();
        if (percentage > 50) {
            alert(`Lead ID ${leadId} has scratched more than 50% of the card!`);

            // Update the CRM
            updateLeadStatus(leadId);
        } else {
            requestAnimationFrame(checkScratchedPercentage);
        }
    };

    const initializeScratchCard = async () => {
        const hasScratched = await checkLeadStatus(leadId);
        if (hasScratched) {
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
let appearanceCount = new Array(100);
for (let i = 0; i < appearanceCount.length; i++) {
    appearanceCount[i] = 0;
}

// loads a json list of objects
async function getImages() {
    const response = await fetch('https://picsum.photos/v2/list?page=1&limit=100');
    const data = await response.json();
    createImageArray(data);
}

// creates an array of objects with every object being an image with author name etc.
function createImageArray(xData) {
    const imageArray = Object.values(xData);
    performSlideshow(imageArray);
}

// creates a slideshow of randomly selected images from a batch of 100
// and an image changes every 5 seconds
function performSlideshow(xArray) {
    loadNewImage(xArray);
    updateStatistics();

    setInterval(() => {
        loadNewImage(xArray);
        updateStatistics();

    }, 5000);
}

// creates random number and takes it as index in array and
// picks up the accompanied url of image and puts it as background for div
function loadNewImage(xArray) {
    randomNumber = Math.floor(Math.random() * 100);
    appearanceCount[randomNumber] += 1;
    document.getElementById("slideshow").innerHTML = `
    <div id="image" style="background-image: url('${xArray[randomNumber].download_url}');"></div>
    `
}

// updates statistics of image appearances in the console
function updateStatistics() {
    console.clear();
    console.log("Current image on display: ", randomNumber);
    console.log("Statistics (number of appearances for each image):")
    for (let i = 0; i < appearanceCount.length; i++) {
        if (appearanceCount[i] != 0) {
            console.log(i + " -> " + appearanceCount[i]);
        }
    }
}

// starts the whole program
getImages();
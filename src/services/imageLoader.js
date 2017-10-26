/**
 * 
 * @param {*} imageArray An array of image urls. Urls should be strings.
 * @return {Promise} Returns a promise that calls true when all the images are loaded.
 */
function loadImages (imageArray) {
    let images = [];
    let p = new Promise(function (resolve, reject) {
        let imagesToLoad = imageArray.slice(0);
        for (let imageUrl of imageArray) {
            let image = new Image();
            image.src = imageUrl;
            image.onload = imageLoaded.bind(this, 
                imagesToLoad,
                imageUrl,
                images,
                image,
                resolve);
            image.onerror = reject.bind(null);
        }
    });
    return p;
}

/**
 * 
 * @param {array} imageList An array of image urls. URLs should be strings.
 * @param {string} url 
 * @param {array} imagesLoaded All loaded images
 * @param {Image} image The image containing the loaded image
 * @param {resolve} resolve The callback when all images have loaded
 */
function imageLoaded (imageList, url, imagesLoaded, image, resolve) {
    let imageIndex = imageList.indexOf(url);
    imageList.splice(imageIndex, 1);
    imagesLoaded.push(image);
    if (imageList.length === 0) resolve(imagesLoaded);
}

module.exports = {
    loadImages: loadImages
};
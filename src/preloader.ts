/**
 *
 * @param src
 * @param timeout
 */
export function loadImg(src: string, timeout = 500) {
    let imgPromise = new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => {
            resolve({
                src: src,
                width: img.naturalWidth,
                height: img.naturalHeight,
                weight: (img.naturalWidth || 1) * (img.naturalHeight || 1),
            });
        });
        img.addEventListener('error', function () {
            console.warn(`xIFr: Error when trying to "pre-fetch" image ${src}.`);
            reject();
        });
        img.src = src;
    });
    const timer = new Promise((_resolve, reject) => {
        setTimeout(reject, timeout);
    });
    return Promise.race([imgPromise, timer]);
}

export function loadImgAll(imgList: any[], timeout = 500) {
    // Could we use https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode ?
    console.debug("calling loadImgAll with imgList: " + JSON.stringify(imgList));
    return new Promise((resolve, _reject) => {
        Promise.all(
            imgList.map((src) => loadImg(src, timeout)).map((p) => p.catch((_e) => false))
        ).then((results) => resolve(results.filter((r) => r)));
    });
}

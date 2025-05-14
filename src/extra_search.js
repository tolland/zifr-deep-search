import {getBgImgs} from "./bg_images";
import {blacklistedImage} from "./blocklistimage";
import {getSVGEmbeddedImages} from "./svg_embedded";
import '../WebExtension/context.js';

/**
 * Search for extra images in backgrounds or in SVGs on or below the given element.
 * @param elem
 * @param xtrSizes
 * @param deepSearchBiggerLimit
 * @param deepSearchBigger
 * @param deepSearchGenericLimit
 * @returns {{}}
 */
export function extraSearch(elem, xtrSizes, deepSearchBiggerLimit = 250 * 250, deepSearchBigger = false, deepSearchGenericLimit = 10 * 10) {
    const xtrImgURLsUnsorted = Array.from(
        new Set([...getBgImgs(elem), ...getSVGEmbeddedImages(elem)])
    );
    console.debug(
        `extraSearch(): Following "extra" image urls are found on/below ${elem.nodeName.toLowerCase()}: ${JSON.stringify(
            xtrImgURLsUnsorted
        )}.`
    );
    context.EXTRASEARCH &&
    console.log(
        `xIFr: Found ${
            xtrImgURLsUnsorted.length
        } extra background (or in SVG) image URLs to check on/below ${elem.nodeName.toLowerCase()}: \n${JSON.stringify(
            xtrImgURLsUnsorted
        )}`
    );
    if (xtrImgURLsUnsorted.length > 0) {
        const xtrImgURLs = [];
        for (const im of xtrSizes) {
            if (xtrImgURLsUnsorted.find((xSrc) => im.src === xSrc)) {
                xtrImgURLs.push(im.src); // same order as in the already sorted xtrSizes
            }
        }
        context.LOGEXTRASEARCH && console.log(`xIFr: - Same list sorted: ${JSON.stringify(xtrImgURLs)}`);
        if (xtrImgURLsUnsorted.length > xtrImgURLs.length) {
            const difference = xtrImgURLsUnsorted.filter(
                (element) => !xtrImgURLs.includes(element)
            );
            console.warn(`xIFr: Something fell out the loop: ${difference}.`);
        }
        console.debug(
            'First extra background (or in SVG) image to check in SORTED list: ' + xtrImgURLs[0]
        );
        for (const xSrc of xtrImgURLs) {
            const imgData = xtrSizes.find((xs) => xs.src === xSrc);
            if (
                imgData?.width &&
                !blacklistedImage(imgData.src) &&
                ((deepSearchBigger &&
                        imgData.width * imgData.height > deepSearchBiggerLimit) ||
                    (!deepSearchBigger &&
                        imgData.width * imgData.height > deepSearchGenericLimit))
            ) {
                const image = {};
                image.imageURL = xSrc;
                image.mediaType = 'image';
                image.naturalWidth = imgData.width;
                image.naturalHeight = imgData.height;
                image.deepSearchBiggerLimit = deepSearchBiggerLimit;
                image.deepSearchBigger = deepSearchBigger;
                image.source = 'extra-search image'; // probably elem.nodeName, but not for sure
                image.baseURI = elem.baseURI;
                console.debug(
                    'extraSearch(): Returning found image (background or svg) ' +
                    JSON.stringify(image)
                );
                return image;
            }
        }
    }
}
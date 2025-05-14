import { blacklistedImage } from './blocklistimage';
import { deepSearchConfig } from './deep_search_config';
import { ClickPosition } from './types';
import { isInsideElement } from './dom_utils';

/**
 *
 * @param elem - Any DOM element, or Node subclass, which can be used to search for images.
 * @param clickPosition - The position of the mouse click, to check whether the click is inside the element, or its children.
 * @param documentImages
 * @param deepSearchBiggerLimit
 * @param deepSearchBigger
 * @param deepSearchGenericLimit - Minimum image-size to be relevant:
 * @returns {*}
 */
export function imageSearch(
    elem: Node,
    clickPosition?: ClickPosition,
    documentImages: HTMLImageElement[] = [],
    deepSearchBiggerLimit = 250 * 250,
    deepSearchBigger = false,
    deepSearchGenericLimit = 100 * 100,
): HTMLImageElement | undefined {
    // TODO: Look if elem has a shadowDOM beneath it?
    //  https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/dom/openOrClosedShadowRoot
    //  element.openOrClosedShadowRoot - The Element.openOrClosedShadowRoot read-only property represents the shadow root hosted by the element, regardless if its mode is open or closed (WebExtensions only - Firefox only)
    //  -> Combined: let shadowRoot = chrome.dom?.openOrClosedShadowRoot(element) || element.openOrClosedShadowRoot();
    //  BUT if just looking for *open* shadowRoots:
    //  element.shadowRoot

    deepSearchConfig.IMGSEARCH &&
    console.debug(
        'imageSearch(): Looking for img elements on/below ' +
        elem.nodeName.toLowerCase(),
    );

    // https://time2hack.com/checking-overlap-between-elements/
    // https://www.youtube.com/watch?v=cUZ2r6C2skA
    // https://css-tricks.com/how-to-stack-elements-in-css/
    //const documentImages = []

    /*
    Calling it on an element inside a standard web page will return an HTMLDocument object representing the entire page (or <iframe>).
Calling it on an element inside a shadow DOM will return the associated ShadowRoot.
Calling it on an element that is not attached to a document or a
shadow tree will return the root of the DOM tree it belongs to.
     */
    const rootNode: Node = elem.getRootNode({ composed: false });

    /*
    The images read-only property of the Document interface returns a collection of the images in the current HTML document.
     */
    if (rootNode instanceof Document) {
        documentImages.push(
            ...Array.from(rootNode.images).sort(
                // sort by size descending...
                (a, b) =>
                    (b.naturalWidth || 1) * (b.naturalHeight || 1) -
                    (a.naturalWidth || 1) * (a.naturalHeight || 1),
            ),
        );
    } else if (rootNode instanceof ShadowRoot) {
        documentImages.push(
            ...Array.from(rootNode.querySelectorAll('img')).sort(
                // sort by size descending...
                (a, b) =>
                    (b.naturalWidth || 1) * (b.naturalHeight || 1) -
                    (a.naturalWidth || 1) * (a.naturalHeight || 1),
            ),
        );
    } else {
        console.error('Unknown root node type: ' + rootNode);
        console.dir(rootNode);
    }

    deepSearchConfig.DEEPSEARCH &&
    console.log(
        `%cxIFr: *** Doing initial imageSearch with documentImages list (length ${
            documentImages.length
        })`,
        'color: green',
    );
    deepSearchConfig.DEEPSEARCH &&
    documentImages
        .map(
            (im) =>
                ` (${im.currentSrc}, w=${im.naturalWidth}, s=${
                    (im.naturalWidth || 1) * (im.naturalHeight || 1)
                })`,
        )
        .forEach((value: string, _index: number, _array: string[]) => {
            console.log(value);
        });

    //flags.DEEPSEARCH && console.table(documentImages, ['currentSrc', 'naturalWidth', 'naturalHeight', 'x', 'y', 'src']);

    let candidate: HTMLImageElement | undefined = undefined;

    for (const img of documentImages) {
        if (elem.contains(img)) {
            // img is itself/elem or img is a "sub-node"
            deepSearchConfig.IMGSEARCH &&
            console.debug(
                'Found image within target element! img.src=' +
                img.src +
                ' and naturalWidth=' +
                img.naturalWidth +
                ', naturalHeight=' +
                img.naturalHeight,
            );
            // We could look for best match, or just continue with the first we find?
            deepSearchConfig.IMGSEARCH && console.debug('Candidate!?');

            const propDisplay = window
                .getComputedStyle(img, null)
                .getPropertyValue('display'); // none?

            const propVisibility = window
                .getComputedStyle(img, null)
                .getPropertyValue('visibility'); // hidden?

            // TODO: Maybe also look at computed opacity ??!
            deepSearchConfig.IMGSEARCH &&
            console.debug(
                'PROPs! display=' +
                propDisplay +
                ', visibility=' +
                propVisibility,
            );
            if (
                img.naturalWidth &&
                img.nodeName.toUpperCase() === 'IMG' &&
                propDisplay !== 'none' &&
                propVisibility !== 'hidden'
            ) {
                if (!clickPosition || isInsideElement(img, clickPosition.x, clickPosition.y)) {
                } else {
                    console.debug(
                        `%cNot Found image within target element! pos: ${clickPosition.x} ${clickPosition.y}`,
                        'color: red',
                    );
                }
                if (
                    (!clickPosition || isInsideElement(img, clickPosition.x, clickPosition.y)) &&
                    !blacklistedImage(img.currentSrc) &&
                    ((deepSearchBigger &&
                            img.naturalWidth * img.naturalHeight >
                            deepSearchBiggerLimit) ||
                        (!deepSearchBigger &&
                            img.naturalWidth * img.naturalHeight >
                            deepSearchGenericLimit))
                ) {
                    if (candidate !== undefined) {
                        deepSearchConfig.IMGSEARCH &&
                        console.debug(
                            'Compare img with candidate: ' +
                            img.naturalWidth * img.naturalHeight +
                            ' > ' +
                            candidate.naturalWidth *
                            candidate.naturalHeight +
                            '? -  document.images.length = ' +
                            document.images.length,
                        );
                        if (
                            img.naturalWidth * img.naturalHeight >
                            candidate.naturalWidth * candidate.naturalHeight
                        ) {
                            deepSearchConfig.IMGSEARCH &&
                            console.debug(
                                'Setting new candidate. -  documentImages.length = ' +
                                documentImages.length,
                            );
                            candidate = img;
                        }
                    } else {
                        deepSearchConfig.IMGSEARCH &&
                        console.debug(
                            'Setting first candidate. -  documentImages.length = ' +
                            documentImages.length,
                        );
                        candidate = img;
                    }
                }
            }
        }
    }

    if (typeof candidate !== 'undefined') {
        console.debug('Found! Let\'s use best candidate: ' + candidate.src);
        console.debug(
            'imageSearch(): Returning found image (img) ' +
            JSON.stringify(candidate),
        );
        return candidate;
    }
    // nothing found by simple search
}

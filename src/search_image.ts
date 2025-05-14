import { loadImgAll } from './preloader';
import { imageSearch } from './image_search';
import { deeperSearch } from './deeper_search';
import { getBgImgs } from './bg_images';
import { getSVGEmbeddedImages } from './svg_embedded';

import { deepSearchConfig } from './deep_search_config';
import { ClickPosition } from './types';


/**
 * given an element in the dom, search for an image in the children
 * progressively working up the dom until an image is found
 * @param elem The HTML element that was clicked or mouseovered
 * @param position the position of the click or mouseover
 * @returns {Promise<void>|Promise<Awaited<*>>|Promise<Awaited<unknown>>|Promise<unknown>}
 */
export async function searchImage(elem: Element, position?: ClickPosition): Promise<HTMLImageElement | undefined> {

    console.debug(' *** ADVANCED MODE WITH DEEP SEARCH *** in searchImage in content script');
    //console.dir(elem);

    // initialize a cache for the list of document images
    // const documentImages: HTMLImageElement[] = [];

    // simple search for child imaages of the element
    var image = imageSearch(elem, position);
    deepSearchConfig.IMGSEARCH && console.dir(image);

    if (image) {
        return image;
    }

    const extraLoads: string[] = [];

    const bgAlternatives = new Map(); // Will be updated by updateBgAlternatives

    let nodeName = elem.nodeName?.toLowerCase(); // node name of context (right-click) target
    deepSearchConfig.IMGSEARCH &&
    console.log(
        `xIFr: The righclicked element is a <${nodeName} /> (${elem}) found on ${elem.ownerDocument.documentURI} (${elem.ownerDocument}).`,
    );


    let rootNode: Node | null = elem.getRootNode({ composed: false });
    if (rootNode instanceof ShadowRoot) {
        deepSearchConfig.DEEPSEARCH &&
        console.warn(
            `xIFr: We are in a shadowDOM (Host element: <${rootNode.host.nodeName?.toLowerCase()} />). Current version of xIFr might have limited Deep Search support here.`,
        );
    }

    // @TODO don't think we need to full recursion here
    // make this an option
    let counter = 0;
    while (rootNode) {
        if (counter > 10) {
            console.warn('xIFr: Stopping deep search at 10 levels deep');
            break;
        }
        deepSearchConfig.DEEPSEARCH &&
        console.log(
            `xIFr: Finding "extras" to preload below root ${rootNode.nodeName?.toLowerCase()}...`,
        );
        extraLoads.push(...getBgImgs(rootNode, bgAlternatives), ...getSVGEmbeddedImages(rootNode as HTMLElement));
        if (rootNode instanceof ShadowRoot) {
            rootNode = rootNode.host?.getRootNode({ composed: false });
        } else {
            rootNode = rootNode.parentNode;
        }
        counter++;
    }


    image = deeperSearch(
        elem,
        position,
        bgAlternatives,
    );

    if (image) {
        return image;
    }

    const extraImages = loadImgAll(Array.from(new Set(extraLoads)));

    const xtrSizes = await extraImages;
    console.debug(
        'Going deep search with preloaded backgrounds plus images in svg and shadowDOM: ' +
        JSON.stringify(xtrSizes),
    );
    deepSearchConfig.DEEPSEARCH &&
    console.log(
        `xIFr: *** Doing deeperSearch with "extras": ${JSON.stringify([
            ...extraLoads,
        ])}`,
    );
    return deeperSearch(
        elem,
        position,
        bgAlternatives,
    );
}

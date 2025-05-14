import {imageSearch} from "./image_search";
import { deepSearchConfig } from './deep_search_config';
import { ClickPosition } from './types';

export function deeperSearch(node: Node, clickPosition?: ClickPosition, bgAlternatives = new Map()) {
    console.debug(
        'Entering deeperSearch() with elem=' +
        node.nodeName +
        ' and elem.parentNode=' +
        node.parentNode?.nodeName
    );


    console.debug('deeperSearch(): No image from extraSearch()');

    let parentNode: Node | undefined = node.parentNode ?? undefined;

    if (!parentNode && node instanceof ShadowRoot && node.host) {
        parentNode = node.host;
        deepSearchConfig.DEEPSEARCH &&
        console.log(
            `xIFr/deeperSearch(): Using shadowDOM host element (${parentNode.nodeName.toLowerCase()}) as "parent elem" for next imageSearch()...`
        );
    }

    if (!parentNode) {
        console.debug(
            'deeperSearch(): Cannot go higher from ' +
            node.nodeName.toLowerCase() +
            ', return without image! typeof elem.parentNode = ' +
            typeof node.parentNode
        );
        deepSearchConfig.DEEPSEARCH &&
        console.log(
            `xIFr/deeperSearch(): Cannot go higher from ${node.nodeName.toLowerCase()}, return without image! typeof elem.parentNode = ${typeof node.parentNode}.`
        );
        return; // no image found
    }

    console.debug(
        'deeperSearch(): Going from ' +
        node.nodeName?.toLowerCase() +
        ' element, up to ' +
        parentNode.nodeName?.toLowerCase() +
        ' element...'
    );
    deepSearchConfig.DEEPSEARCH &&
    console.log(
        `xIFr/deeperSearch(): Going from ${node.nodeName} element, up to ${parentNode.nodeName} element...`
    );

    node = parentNode;
    let image = imageSearch(node, clickPosition);

    if (image) {
        console.debug('deeperSearch(): Return with image');
        // Check if bgAlternatives holds a better (jpeg-)alternative:
        // let related = bgAlternatives.get(image.imageURL);
        // if (related) {
        //     image.jpegURL = related.jpeg.url;
        //     image.jpegType = related.jpeg.type;
        //     image.imageType = related.other.type;
        // }
        console.log("got to the end of deeperSearch");
        console.log(image);
        return image;
    } else {
        return deeperSearch(node, clickPosition, bgAlternatives);
    }
}

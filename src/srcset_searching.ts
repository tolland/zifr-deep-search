/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This Source Code Form is "Incompatible With Secondary Licenses", as
 * defined by the Mozilla Public License, v. 2.0.
 */


// srcset attribute holds various sizes/resolutions
// source tag can define alternative formats (but might also hold sizes)
import {ImageInfo, ImageInfoUtil} from "./image";

export const searchSrcSet = (candidate: HTMLImageElement): ImageInfo => {

    const image = ImageInfoUtil.createFromImage(candidate)

    if (
        candidate.parentNode?.nodeName &&
        //candidate.parentNode.nodeName.toUpperCase() === 'PICTURE' &&
        candidate.parentNode instanceof HTMLPictureElement
    ) {
        const picture = candidate.parentNode;
        const potentials = [];
        let foundShownInAvoid = false;
        let descriptorToMatch = '1x';
        for (const child of picture.children) {
            if (child instanceof HTMLSourceElement) {
            // if (child.nodeName.toUpperCase() === 'SOURCE' && child.srcset && child.type) {
                // type is or starts with mimetype;
                if (child.type.startsWith('image/jpeg')) {
                    // We like this being jpeg
                    // Populate potentials with jpeg images...
                    const findings = child.srcset.split(',');
                    for (const found of findings) {
                        const parts = found.trim().split(/\s+/u);
                        const foundUrl = new URL(parts[0].trim(), child.baseURI).href;
                        let foundDescriptor = parts.slice(1).join(' ');
                        if (foundDescriptor === '') {
                            foundDescriptor = '1x';
                        }
                        let foundWeight = parseInt(foundDescriptor, 10);
                        if (isNaN(foundWeight)) {
                            foundWeight = 0;
                        }
                        if (foundUrl === image.imageURL) {
                            image.imageType = 'image/jpeg';
                        }
                        potentials.push({
                            url: foundUrl,
                            descriptor: foundDescriptor,
                            type: 'image/jpeg',
                            sortWeight: foundWeight,
                        });
                    }
                } else {
                    // Let's avoid this
                    // Detect if use of image to avoid...
                    const findings = child.srcset.split(',');
                    const foundType = child.type.split(';')[0].trim();
                    for (const found of findings) {
                        const parts = found.trim().split(/\s+/u);
                        const foundUrl = new URL(parts[0].trim(), child.baseURI).href;
                        let foundDescriptor = parts.slice(1).join(' ');
                        if (foundDescriptor === '') {
                            foundDescriptor = '1x';
                        }
                        if (foundUrl === image.imageURL) {
                            foundShownInAvoid = true;
                            descriptorToMatch = foundDescriptor;
                            image.imageType = foundType;
                            break;
                        }
                    }
                }
            }
        }

        if (foundShownInAvoid) {
            // We like to find an alternative (hopefully jpeg) to parse meta-data from...
            if (potentials.length === 0 && candidate.srcset) {
                // If potentials is empty and img.srcset is defined, add img.srcset to potentials...
                const findings = candidate.srcset.split(',');
                for (const found of findings) {
                    const parts = found.trim().split(/\s+/u);
                    const foundUrl = new URL(parts[0].trim(), candidate.baseURI).href;
                    let foundDescriptor = parts.slice(1).join(' ');
                    if (foundDescriptor === '') {
                        foundDescriptor = '1x';
                    }
                    let foundWeight = parseInt(foundDescriptor, 10);
                    if (isNaN(foundWeight)) {
                        foundWeight = 0;
                    }
                    potentials.push({
                        url: foundUrl,
                        descriptor: foundDescriptor,
                        type: '',
                        sortWeight: foundWeight,
                    });
                }
            }
            if (potentials.length > 0) {
                // Replace unwanted image with something from potentials list...
                for (const potential of potentials) {
                    if (potential.descriptor === descriptorToMatch) {
                        image.jpegURL = potential.url;
                        image.jpegType = potential.type;
                        return image;
                    }
                }
                // If no exact descriptor-match in potentials, then use the one with "highest descriptor" (probably largest image)...
                const potential = potentials.reduce((max, other) =>
                    max.sortWeight > other.sortWeight ? max : other
                ); // Find item with highest sortWeight (descriptor-value)
                image.jpegURL = potential.url;
                image.jpegType = potential.type;
                return image;
            }
            // If no potentials at all, use fallback img.src...
            image.jpegURL = candidate.src;
        }
        // If we arrive here, we are probably already using img fallback. Cannot do any better.
    }

    return image;

}
/**
 * searches for alternatives to jpeg images in background-image css properties??
 * @param bgimage
 * @param bgAlternatives
 * @returns {Map<any, any>}
 */
export function updateBgAlternatives(bgimage: string, bgAlternatives = new Map()) {
    // Does getComputedStyle() return exact same format in all browsers? If one day Chromium (or other
    // browsers) starts supporting "deep search", maybe re-visit this to verify the functionality!?...
    // https://developer.mozilla.org/en-US/docs/Web/CSS/background-image
    // https://developer.mozilla.org/en-US/docs/Web/CSS/image/image-set
    const optionsParser = /^(image-set\()?url\("(?<url>[^"]+)"\)\s(?<resolution>\S+)\stype\("(?<type>[^"]+)"\)/iu;

    // console.log('Computed background-image css with some image-set and type: ' + bgimage);
    const imageSets = bgimage.split(/(^\s*|\s+)(?=image-set)/u).filter((part) => part.startsWith('image-set('));
    for (const imageSet of imageSets) {
        // console.log('Looking at imageSet:' + imageSet);
        const imagedefs = imageSet.split(', ').filter((opts) => opts.includes('url(') && opts.includes('type('));
        // console.log('Computed background-image relevant imagedefs count:' + imagedefs.length);
        let jpegs = [];
        let others = [];
        for (const imagedef of imagedefs) {
            // console.log('Now image-def:' + imagedef);
            // Notice, we expect the properties/options of imagedef in order: (absolute)url, resolution, type. Like:
            // url("https://www.rockland.dk/img/test.avif") 1dppx type("image/avif")
            const options = imagedef.trim().match(optionsParser);
            if (options !== null && options.groups !== undefined) {
                // console.log('- Matched url: ' + options.groups.url);
                // console.log('- Matched resolution: ' + options.groups.resolution);
                // console.log('- Matched type: ' + options.groups.type);
                let obj = {
                    'url': options.groups.url,
                    'resolution': options.groups.resolution,
                    'type': options.groups.type,
                };
                if (options.groups.type === 'image/jpeg') {
                    jpegs.push(obj);
                } else {
                    others.push(obj);
                }
            }
        }
        for (const other of others) {
            for (const jpeg of jpegs) {
                if (other.resolution === jpeg.resolution) {
                    bgAlternatives.set(other.url, { 'other': other, 'jpeg': jpeg });
                }
            }
        }
    }
    return bgAlternatives;
}


/**
 *  Much of following based on code/concept from https://blog.crimx.com/2017/03/09/get-all-images-in-dom-including-background-en/ (by CRIMX) ...
 *
 */
export function getBgImgs(elem: Node, _bgAlternatives = new Map()): string[] {
    const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/giu;
    let counter = 0;

    let extras = [];

    if (elem instanceof Element) {
        extras.push(elem); // Includes elem (itself) unless elem is (f.ex.) document
        extras.concat(Array.from(elem.querySelectorAll('*')));
    }

    if ((elem instanceof DocumentFragment) && (elem instanceof ShadowRoot)) extras.push(elem.host); // include host-element if elem is root of a shadowDOM

    return Array.from(
        extras.reduce((collection, node) => {
            const cstyle = window.getComputedStyle(node, null);
            const display = cstyle.getPropertyValue('display');
            const visibility = cstyle.getPropertyValue('visibility');
            const appleHack = location.hostname.endsWith('.apple.com');
            if (display !== 'none' && visibility !== 'hidden') {
                let bgimage = cstyle.getPropertyValue('background-image');
                if (bgimage === 'none' && appleHack) {
                    // An experimental/temporary(?) site-specific hack for apple.music.com...
                    // I don't know how they do it (will have to investigate), but this works to
                    // get the background-image in headers of "itunes" artist pages (as of 08/2023):
                    bgimage = cstyle.getPropertyValue('--background-image');
                }
                if (bgimage.includes('image-set(') && bgimage.includes('type("image/jpeg")')) {
                    updateBgAlternatives(bgimage, _bgAlternatives = new Map());
                }
                let match: RegExpMatchArray | null;
                while ((match = srcChecker.exec(bgimage)) !== null) { // There might be multiple, like: background-image: url("img_tree.gif"), url("paper.gif");
                    if (counter > 20) {
                        console.warn('xIFr: *** Breaking out of getBgImgs loop after 20 iterations!');
                        break;
                    }
                    console.log(`Found background-image: ${match[1]}`);
                    collection.add(match[1]);
                    counter++;
                }
            }
            return collection;
        }, new Set<string>()),
    );
}


/*
 * Finding and loading image(s) embedded in inline SVG....
 */
export function getSVGEmbeddedImages(elem: HTMLElement): string[] {
    return Array.from(
        (['image', 'feimage'].includes(elem.nodeName.toLowerCase()) ? [elem] : []).concat(Array.from(elem.querySelectorAll('svg image, svg feImage')))
            .reduce((collection, node) => {
                const cstyle = window.getComputedStyle(node, null);
                const display = cstyle.getPropertyValue('display');
                const visibility = cstyle.getPropertyValue('visibility');
                if (display !== 'none' && visibility !== 'hidden') {
                    if (node instanceof SVGImageElement && node.href?.baseVal) {
                        collection.add(new URL(node.href.baseVal, node.baseURI).href);
                    }
                }
                return collection;
            }, new Set<string>())
    );
} // But also: https://www.petercollingridge.co.uk/tutorials/svg/interactive/javascript/ ?

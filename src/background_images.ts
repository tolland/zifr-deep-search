
// This is the grok generated code. It seems more sensible that what we are currently
// using. We should consider replacing the current code with this one.

/**
 * Extracts background image URLs from a DOM Node and its descendants.
 * @param node - The DOM Node to search (e.g., Element, DocumentFragment, ShadowRoot).
 * @returns An array of unique background image URLs.
 */
export function getBackgroundImages(node: Node): string[] {
    const imageSet = new Set<string>(); // Use Set to avoid duplicates

    // Recursively process the node
    processNode(node, imageSet);

    return Array.from(imageSet);
}

/**
 * Helper function to process a single node and its children.
 * @param node - The current node being processed.
 * @param imageSet - Set to collect unique background image URLs.
 */
function processNode(node: Node, imageSet: Set<string>): void {
    // Handle different node types
    if (node.nodeType === Node.ELEMENT_NODE) {
        // Cast to Element for Element-specific properties
        const element = node as Element;
        extractBackgroundFromElement(element, imageSet);

        // Process child nodes
        const children = element.childNodes;
        children.forEach((child) => processNode(child, imageSet));

        // Handle ShadowRoot if present (for Shadow DOM)
        if ('shadowRoot' in element && element.shadowRoot) {
            processNode(element.shadowRoot, imageSet);
        }
    } else if (node instanceof DocumentFragment || node instanceof ShadowRoot) {
        // Handle DocumentFragment or ShadowRoot (no styles, just children)
        const children = node.childNodes;
        children.forEach((child) => processNode(child, imageSet));
    }
}

/**
 * Extracts background image URLs from an Element's computed styles.
 * @param element - The DOM Element to inspect.
 * @param imageSet - Set to collect unique background image URLs.
 */
function extractBackgroundFromElement(element: Element, imageSet: Set<string>): void {
    // SVGElement might have different styling, but we'll check computed styles
    if (element instanceof HTMLElement || element instanceof SVGElement) {
        const style = window.getComputedStyle(element);
        let backgroundImage = style.getPropertyValue('background-image');

        if(!backgroundImage){
            backgroundImage = style.getPropertyValue('--background-image');
        }

        if (backgroundImage && backgroundImage !== 'none') {
            const urls = extractUrlsFromBackground(backgroundImage);
            urls.forEach((url) => imageSet.add(url));
        }
    }
}

/**
 * Parses the background-image CSS value to extract URLs.
 * @param backgroundImage - The raw background-image CSS value (e.g., "url(image.jpg), url(image2.png)").
 * @returns An array of image URLs.
 */
function extractUrlsFromBackground(backgroundImage: string): string[] {
    const urls: string[] = [];
    const urlRegex = /url\(['"]?([^'"]+)['"]?\)/g;
    let match;

    while ((match = urlRegex.exec(backgroundImage)) !== null) {
        const url = match[1];
        if (url && !url.startsWith('data:')) { // Exclude data URLs if unwanted
            urls.push(url);
        }
    }

    return urls;
}
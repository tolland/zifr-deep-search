
/**
 * Determine whether an x,y position is within the bounds of an element
 *
 */
export function isInsideElement(element: Element, x: number, y: number) {
    const rect = element.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

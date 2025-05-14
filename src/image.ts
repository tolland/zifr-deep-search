
/**
* Serializable interface for HTMLImage object
*
* enough to display and locate an image
*/
export interface ImageInfo {
    imageURL: string;
    imageType: string;
    mediaType: string;
    naturalWidth?: number;
    naturalHeight?: number;
    deepSearchBiggerLimit?: number;
    deepSearchBigger?: boolean;
    source?: string;
    srcset?: string;
    crossOrigin?: string | null;
    referrerPolicy?: string; // https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement
    baseURI?: string; // base URL of the document containing the node (might be set by <base>)
    x?: number;
    y?: number;
    jpegURL?: string;
    jpegType?: string;
}

export class ImageInfoUtil {
    static create(imageURL: string, imageType: string, mediaType: string): ImageInfo {
        return {
            imageURL: imageURL,
            imageType: imageType,
            mediaType: mediaType
        };
    }

    static createFromImage(image: HTMLImageElement): ImageInfo {
        return {
            imageURL: image.currentSrc || image.src,
            imageType: '', // so far unknown mimetype
            mediaType: 'image',
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
            deepSearchBiggerLimit: 0,
            deepSearchBigger: false,
            source: image.nodeName.toLowerCase() + ' element',
            srcset: image.srcset,
            crossOrigin: image.crossOrigin,
            referrerPolicy: image.referrerPolicy,
            baseURI: image.baseURI,
            x: image.x,
            y: image.y,
            jpegURL: image.src,
            jpegType: image.currentSrc,
        };
    }
}
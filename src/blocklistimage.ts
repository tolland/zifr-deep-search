

export function blacklistedImage(src: string) {
    // todo: Make blacklist configurable!
    if (src.startsWith('data:') && (src.length < 500 || !src.startsWith('data:image/'))) {
        console.warn('xIFr: Skipping ' + src);
        // ignore tiny inline data: images - and those that doesn't have some 'image' mimetype
        return true;
    } else if (src.startsWith('moz-extension:') || src.startsWith('chrome-extension:')) {
        console.warn('xIFr: Skipping ' + src);
        return true; // Apparently we can detect images inserted by other extensions, but we cannot access them
    }
    return [
        {
            url: 'https://combo.staticflickr.com/ap/build/images/sprites/icons-cc4be245.png',
            regexp: false,
        },
        {
            url: 'https://combo.staticflickr.com/ap/build/images/fave-test/white@1x.png',
            regexp: false,
        },
        {
            url: 'https://combo.staticflickr.com/ap/build/images/sprites/icons-87310c47.png',
            regexp: false,
        },
        {
            url: 'https://static.kuula.io/prod/assets/sprites-main.png',
            regexp: false,
        },
        {
            url: 'https://m.media-amazon.com/images/G/01/digital/music/player/web/EQ_accent.gif',
            regexp: false,
        },
        {
            url: 'https://m.media-amazon.com/images/G/01/digital/music/player/web/EQ_accent.webp',
            regexp: false,
        },
        {
            url: 'https://www.instagram.com/static/bundles/es6/sprite_core_32f0a4f27407.png/32f0a4f27407.png',
            regexp: false,
        },
        {
            url: 'https://static.xx.fbcdn.net/rsrc.php/v3/yt/r/pQ6WpMqXLJA.png',
            regexp: false,
        },
        {
            url: 'https://static.cdninstagram.com/images/instagram/xig_legacy_spritesheets/sprite_core.png',
            regexp: false,
        },
        {
            url: 'https://static.cdninstagram.com/rsrc.php/v3/y5/r/TJztmXpWTmS.png',
            regexp: false,
        },
    ].some(function (item) {
        return src.startsWith(item.url);
    });
}
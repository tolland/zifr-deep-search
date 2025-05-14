# deep search API

This is a set of methods derived from xifr plugin, which is used to try and
find important elements which are buried or obscured by other elements in the
DOM.

Typically, the thing that most image hosting sites are trying to avoid, is
having save-as available in the content menu. This can be done by hiding
the image behind a div, or putting some other element on top of it. This
plugin tries to find the image, by searching the target element, its children,
and then going up a level, and searching the children again. (obviously this is
going to redundantly search the same elements multiple times, but it is a
good start)

The other issue is that particularly img elements can be <IMG SRC=x> , but they
can also be backgrounds on divs, or set in stylesheets, or in various niche
ways.
mostly the methods uncovering these edge cases are interesting, but not very
useful, as mostly searching siblings, one or two parents child tree is
sufficient to find the image.

There are a few tricky cases which deep search handles, which is when a small
image is put under the click, so that it is found before the intended image.
Deep search sets a minimum size of interesting images and keeps searching to
find a decently
sized one.

There is some parameters to control this behaviour, but mostly I've made a bit
of a mess
of porting the code, so it probably needs quite a bit of tidying up.

## Methods

### Preloader

This attempts to walk a list of images ensuring that they have been requested
and loaded

## notes from old code

In the original code there are some TODO items which mention looking at
scenarios
where getTargetElementid does not return an element:

```
// TODO can I use focused element instead if it fails? (but that requires there is only ONE contentscript running!)
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/getTargetElement
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/OnClickData
```

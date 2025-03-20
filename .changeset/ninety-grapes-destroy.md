---
'svelte-maplibre': major
---

Set `loaded = true` on `style.load` instead of `load`.

This greatly improves responsiveness of setting up the initial sources and layers.
The MapLibre component also no longer gates rendering its children snippet on `loaded`.
The `Layer` and various source-based components included with this library will wait for it, but if you have
a custom component you may need to wait for `loaded` yourself using a pattern like this: 

```javascript

const { map, loaded } = $derived(getMapContext())

$effect(() => {
    if(map && loaded) {
        map.addSource(...);
    }
})

```

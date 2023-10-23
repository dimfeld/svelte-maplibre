---
'svelte-maplibre': major
---

Allow setting layers to be non-interactive. Layers with `interactive={false}` will not emit mouse events, and will not
participate in hit testing when comparing to other layers with `eventsIfTopMost`.

This is useful, for example, when placing a SymbolLayer on top of a
CircleLayer. See the updated "Clusters and Popups" example; previous the popup would disappear when the mouse was over
the labels, but not it does not.

This is a breaking change:

- The `interactive` prop for `Marker` and `MarkerLayer` has been renamed to `asButton`, to make room for the new
    `interactive` prop.
- DeckGlLayer still continues to allow the `pickable` prop, but `interactive` should be used instead for consistency.
    The behavior here is unchanged though.

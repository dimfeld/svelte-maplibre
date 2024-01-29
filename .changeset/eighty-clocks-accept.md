---
'svelte-maplibre': patch
---

Explicitly unsubscribe from events in Layer to avoid race condition between Layer and containing Source being torn down

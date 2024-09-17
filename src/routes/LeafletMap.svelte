<script>
    import { onMount } from 'svelte';

    let map;
    let mapElement;

    function handleZoomIn() {
        if (map) map.zoomIn();
    }

    onMount(async () => {

        if (typeof window !== 'undefined'){
            const leaflet = await import('leaflet');
            await import('leaflet/dist/leaflet.css');
            
            map = leaflet.map(mapElement, {
                zoomControl: false  // Disable default zoom control
            }).setView([47.606, -122.33], 12);

            leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            // Trigger a resize event after a short delay
            setTimeout(() => {
                map.invalidateSize();
            }, 0);

        }
    });
</script>

<style>
    :global(body) {
      margin: 0;
      padding: 0;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }
    .map-container {
      height: 100%;
      width: 100%;
      position: relative;
    }

    .controls {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1000;
        background: white;
        padding: 10px;
        border-radius: 4px;
        box-shadow: 0 1px 5px rgba(0,0,0,0.65);
    }

    /* Ensure Leaflet's zoom controls don't get cut off */
    :global(.leaflet-control-container .leaflet-top .leaflet-control) {
        margin-top: 50px;
    }

</style>

<div class="map-container" bind:this={mapElement}>
    <div class="controls">
        <button on:click={handleZoomIn}>Zoom In</button>
    </div>
</div>

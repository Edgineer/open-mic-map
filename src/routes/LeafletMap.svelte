<script>
    import { onMount } from 'svelte';
    import data from '../public/open_mic.json';

    let map;
    let mapElement;

    // Replace with your actual Buy Me a Coffee URL
    const bmcUrl = "https://www.buymeacoffee.com/eloxacto";

    let welcomeMessage = true;
    let motivationMessage = false;

    function dayOfWeek() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        return days[today.getDay()];
    }

    function formatDate() {
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }


    const currentDay = dayOfWeek();
    const currentDate = formatDate();

    onMount(async () => {
        if (typeof window !== 'undefined'){

            setTimeout(() => {
                welcomeMessage = false; // Hide the message after 5 seconds
                motivationMessage = true;
            }, 5000); // 5,000 milliseconds = 5 seconds

            setTimeout(() => {
                motivationMessage = false; // Hide the message after 10 seconds
            }, 10000); // 10,000 milliseconds = 10 seconds

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

            // Define the custom icon
            const microphoneIcon = leaflet.icon({
                iconUrl: '/mic-vec.png', // Replace with your icon image path
                iconSize: [32, 32], // Size of the icon
                iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
                popupAnchor: [0, -32] // Point from which the popup should open relative to the iconAnchor
            });

            // Trigger a resize event after a short delay
            setTimeout(() => {
                map.invalidateSize();
            }, 0);

            // Iterating through the data rows
            data.forEach(row => {
                if(row[currentDay] !== 'no'){

                    const popupContent = `
                        <div class="popup-content">
                        <h2>${row.Name}</h2>
                        <h3>${row.Address}</h3>
                        <p><strong>Sign-up/Start Time:</strong> ${row['Signup/Start']}</p>
                        </div>
                    `;
                    let coords = row.Coordinates.replace(/\[|\]/g, '').split(',');
                    let lat = parseFloat(coords[0]);
                    let lon = parseFloat(coords[1]);
                    leaflet.marker([lat, lon], { icon: microphoneIcon }).addTo(map)
                        .bindPopup(popupContent)
                }
            });

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

    .welcome-message {
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 48px;
        font-family: 'Comic Sans MS'; /* Fun, welcoming font */
        color: red;
        opacity: 0.8; /* Makes it slightly opaque */
        padding: 10px 20px;
        border-radius: 10px;
        z-index: 1000; /* Ensure it stays on top */
    }

    /* Ensure Leaflet's zoom controls don't get cut off */
    :global(.leaflet-control-container .leaflet-top .leaflet-control) {
        margin-top: 50px;
    }

    .bmc-button {
        position: fixed;
        bottom: 10px;
        left: 10px;
        background-color: #FF5F5F;
        color: #000000;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        font-family: 'Comic Sans MS', sans-serif;
        font-size: 16px;
        z-index: 1000; /* Ensure the button is on top */
        cursor: pointer;
        text-align: center;
        display: flex;
        align-items: center;
    }

</style>

<div class="map-container" bind:this={mapElement}>
        {#if welcomeMessage}
        <div class="welcome-message">
            Open Mics this {currentDay}, {currentDate}
        </div>
        {/if}

        {#if motivationMessage}
        <div class="welcome-message">
            💣💣You got this!💣💣
        </div>
        {/if}
</div>

<a class="bmc-button" href={bmcUrl} target="_blank">
    🍕 Buy me a pizza
</a>

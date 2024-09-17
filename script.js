const socket = io();

// Initialize the map with default coordinates
const map = L.map('map').setView([0, 0], 10);

// Add the tile layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Jubraj',
}).addTo(map);

// Object to store markers
const markers = {};

// Check if geolocation is supported and available
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            // Emit location to the server
            socket.emit('send-location', { latitude, longitude });

            // Optionally update the map view to the current location
            map.setView([latitude, longitude], 16);
        },
        (error) => {
            console.error('Error getting location:', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
} else {
    console.log('Geolocation is not supported by this browser.');
}

// Handle receiving location updates from the server
socket.on('receive-location', (data) => {
    console.log('Received location:', data);
    const { id, latitude, longitude } = data;

    // Check if the marker for this ID already exists
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Create and add a new marker for this ID
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Handle user disconnection
socket.on('user-disconnected', (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});

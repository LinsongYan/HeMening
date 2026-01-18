// Report Page JavaScript

// Severity rating descriptions
const severityDescriptions = {
    1: '轻微 - 言语上的不适，如不当玩笑或刻板印象评论',
    2: '一般 - 明显的偏见言论或态度，但未造成实质影响',
    3: '中等 - 涉及服务拒绝、区别对待或持续性骚扰',
    4: '严重 - 威胁性言行、职场/学校歧视或造成经济损失',
    5: '极严重 - 涉及肢体冲突、暴力威胁或严重心理创伤'
};

// Sample incident data for the heatmap (city-level coordinates in Netherlands)
// Format: [lat, lng, intensity]
const sampleIncidents = [
    // Amsterdam area - higher density
    [52.3676, 4.9041, 0.8],
    [52.3702, 4.8952, 0.7],
    [52.3556, 4.9136, 0.6],
    [52.3847, 4.8824, 0.5],
    [52.3508, 4.9210, 0.7],

    // Rotterdam area
    [51.9244, 4.4777, 0.6],
    [51.9225, 4.4792, 0.5],
    [51.9167, 4.5000, 0.4],

    // The Hague area
    [52.0705, 4.3007, 0.5],
    [52.0689, 4.2881, 0.4],

    // Utrecht
    [52.0907, 5.1214, 0.4],
    [52.0850, 5.1100, 0.3],

    // Eindhoven
    [51.4416, 5.4697, 0.3],
    [51.4400, 5.4800, 0.2],

    // Groningen
    [53.2194, 6.5665, 0.3],

    // Maastricht
    [50.8514, 5.6910, 0.2],

    // Leiden
    [52.1601, 4.4970, 0.3],

    // Tilburg
    [51.5555, 5.0913, 0.2],

    // Almere
    [52.3508, 5.2647, 0.3],

    // Breda
    [51.5719, 4.7683, 0.2],

    // Nijmegen
    [51.8126, 5.8372, 0.2],

    // Haarlem
    [52.3874, 4.6462, 0.3],

    // Arnhem
    [51.9851, 5.8987, 0.2],

    // Delft
    [52.0116, 4.3571, 0.2]
];

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initStarRating();
    initHeatmap();
    initFormSubmission();
});

// Star Rating Functionality
function initStarRating() {
    const stars = document.querySelectorAll('.star');
    const descriptionEl = document.querySelector('.severity-description');
    let currentRating = 0;

    stars.forEach((star, index) => {
        const rating = index + 1;

        star.addEventListener('mouseenter', () => {
            highlightStars(rating);
            showDescription(rating);
        });

        star.addEventListener('mouseleave', () => {
            highlightStars(currentRating);
            if (currentRating === 0) {
                hideDescription();
            } else {
                showDescription(currentRating);
            }
        });

        star.addEventListener('click', () => {
            currentRating = rating;
            highlightStars(currentRating);
            showDescription(currentRating);
            document.getElementById('severity-input').value = currentRating;
        });
    });

    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    function showDescription(rating) {
        descriptionEl.textContent = severityDescriptions[rating];
        descriptionEl.classList.add('visible');
    }

    function hideDescription() {
        descriptionEl.classList.remove('visible');
    }
}

// Heatmap Initialization
function initHeatmap() {
    // Initialize the map centered on Netherlands
    const map = L.map('heatmap', {
        center: [52.1326, 5.2913], // Center of Netherlands
        zoom: 7,
        minZoom: 6,
        maxZoom: 10,
        scrollWheelZoom: true
    });

    // Add a clean, light tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Create the heat layer with custom gradient
    const heat = L.heatLayer(sampleIncidents, {
        radius: 35,
        blur: 25,
        maxZoom: 10,
        max: 1.0,
        gradient: {
            0.0: 'rgba(0, 255, 0, 0)',
            0.2: 'rgba(0, 255, 0, 0.5)',
            0.4: 'rgba(255, 255, 0, 0.6)',
            0.6: 'rgba(255, 165, 0, 0.7)',
            0.8: 'rgba(255, 69, 0, 0.8)',
            1.0: 'rgba(255, 0, 0, 0.9)'
        }
    }).addTo(map);

    // Update stats
    updateStats();
}

// Update statistics display
function updateStats() {
    const totalIncidents = sampleIncidents.length;
    const avgSeverity = (sampleIncidents.reduce((sum, inc) => sum + inc[2], 0) / totalIncidents * 5).toFixed(1);
    const regionsAffected = new Set(sampleIncidents.map(inc => `${Math.round(inc[0])},${Math.round(inc[1])}`)).size;

    document.getElementById('stat-total').textContent = totalIncidents;
    document.getElementById('stat-severity').textContent = avgSeverity;
    document.getElementById('stat-regions').textContent = regionsAffected;
}

// Form Submission
function initFormSubmission() {
    const form = document.getElementById('report-form');
    const overlay = document.querySelector('.overlay');
    const successMessage = document.querySelector('.success-message');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const severity = document.getElementById('severity-input').value;
        if (!severity || severity === '0') {
            alert('请选择严重程度等级');
            return;
        }

        // Show success message
        overlay.classList.add('visible');
        successMessage.classList.add('visible');

        // Reset form after delay
        setTimeout(() => {
            form.reset();
            document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
            document.querySelector('.severity-description').classList.remove('visible');
            document.getElementById('severity-input').value = '';
        }, 500);
    });

    // Close success message on overlay click
    overlay.addEventListener('click', function () {
        overlay.classList.remove('visible');
        successMessage.classList.remove('visible');
    });

    // Close button in success message
    document.querySelector('.close-success')?.addEventListener('click', function () {
        overlay.classList.remove('visible');
        successMessage.classList.remove('visible');
    });
}

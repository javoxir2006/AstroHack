const NASA_API_KEY = 'rXyHvkRWkWMdgBjmejDbJabsHZ56BcN6vBK7M0Fh';
//const NASA_API_KEY = 'DEMO_KEY';

const backToHomeBtn = document.getElementById('backToHomeBtn');
const header = document.querySelector('header');
const loadingOverlay = document.getElementById('loading');

// Elements specific to home.html
const episodeCards = document.querySelectorAll('.episode-card');

// Elements specific to Mars Rover page
const marsDateInput = document.getElementById('marsDate');
const fetchMarsPhotosBtn = document.getElementById('fetchMarsPhotos');
const marsContentDiv = document.getElementById('marsContent');

// Elements specific to APOD page
const apodDateInput = document.getElementById('apodDate');
const fetchApodBtn = document.getElementById('fetchApod');
const apodContentDiv = document.getElementById('apodContent');

// Elements specific to Asteroids page
const asteroidStartDateInput = document.getElementById('asteroidStartDate');
const asteroidEndDateInput = document.getElementById('asteroidEndDate');
const fetchAsteroidsBtn = document.getElementById('fetchAsteroids');
const asteroidContentDiv = document.getElementById('asteroidContent');

// Elements specific to DONKI page
const donkiDateInput = document.getElementById('donkiDate');
const fetchDonkiBtn = document.getElementById('fetchDonki');
const donkiContentDiv = document.getElementById('donkiContent');

// Elements specific to EPIC Earth Images page
const epicDateInput = document.getElementById('epicDate');
const fetchEpicImagesBtn = document.getElementById('fetchEpicImages');
const epicContentDiv = document.getElementById('epicContent');


function clearAllIntervals() {
    
}

// Utility Functions
function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

function displayError(container, message) {
    if (container && container.classList.contains('terminal-output')) {
        container.innerHTML = `<p class="error-message">> Error: ${message}</p>`;
    } else if (container) {
        container.innerHTML = `<p class="error-message">Error: ${message}</p>`;
    }
    hideLoading();
}

// Helper for formatting API dates/times
function formatTime(isoTime) {
    if (!isoTime) return 'N/A';
    try {
        return new Date(isoTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) + ' UTC';
    } catch {
        return isoTime;
    }
}
function formatDate(isoDate) {
    if (!isoDate) return 'N/A';
    try {
        return new Date(isoDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
    } catch {
        return isoDate;
    }
}


// API FETCH FUNCTIONS

// Section 1: Mars Rover Explorer
async function fetchMarsRoverPhotos(date) {
    showLoading();
    if (marsContentDiv) marsContentDiv.innerHTML = '<p>Searching Mars logs...</p>';
    try {
        const response = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${date}&api_key=${NASA_API_KEY}`);
        if (!response.ok) {
            if (response.status === 404) {
                 throw new Error(`No data found for this date. Try another date.`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.photos && data.photos.length > 0) {
            let photoHtml = '<h3>Mars Rover Photos for ' + date + '</h3><div class="mars-gallery">';
            data.photos.sort((a, b) => {
                if (a.camera.full_name < b.camera.full_name) return -1;
                if (a.camera.full_name > b.camera.full_name) return 1;
                return a.sol - b.sol;
            });

            data.photos.slice(0, 12).forEach(photo => {
                photoHtml += `
                    <div class="mars-photo-item">
                        <img src="${photo.img_src}" alt="Mars Rover Photo">
                        <p>Rover: ${photo.rover.name}</p>
                        <p>Camera: ${photo.camera.full_name} (${photo.camera.name})</p>
                        <p>Sol: ${photo.sol}</p>
                        <p>Earth Date: ${photo.earth_date}</p>
                    </div>
                `;
            });
            photoHtml += '</div>';
            if (marsContentDiv) marsContentDiv.innerHTML = photoHtml;
        } else {
            if (marsContentDiv) marsContentDiv.innerHTML = `<p>No photos found for ${date}. Try a different date (e.g., 2015-06-03 or 2019-12-25, dates closer to 2012 might have less photos).</p>`;
        }
    } catch (error) {
        if (marsContentDiv) displayError(marsContentDiv, `Could not fetch Mars photos: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function setupMarsRoverSection() {
    const today = new Date();
    const defaultDate = new Date(today);
    defaultDate.setDate(defaultDate.getDate() - 300); 
    
    if (marsDateInput) {
        marsDateInput.value = defaultDate.toISOString().split('T')[0];
        marsDateInput.setAttribute('max', today.toISOString().split('T')[0]);
    }
    
    if (fetchMarsPhotosBtn) {
        fetchMarsPhotosBtn.onclick = () => {
            const date = marsDateInput.value;
            if (date) {
                fetchMarsRoverPhotos(date);
            } else {
                if (marsContentDiv) marsContentDiv.innerHTML = '<p class="error-message">Please select a date.</p>';
            }
        };
    }
    if (marsDateInput) fetchMarsRoverPhotos(marsDateInput.value);
}


// Section 2: APOD Portal
async function fetchAPOD(date = '') {
    showLoading();
    if (apodContentDiv) apodContentDiv.innerHTML = '<p>Fetching cosmic vista...</p>';
    try {
        let url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
        if (date) {
            url += `&date=${date}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        let contentHtml = `<h3>${data.title}</h3>`;
        if (data.media_type === 'image') {
            contentHtml += `<img src="${data.url}" alt="${data.title}">`;
        } else if (data.media_type === 'video') {
            const embedUrl = data.url.replace("youtube.com/watch?v=", "youtube.com/embed/").split('&')[0];
            contentHtml += `<div class="apod-video-container"><iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
            contentHtml += `<p>(If video does not load, view directly: <a href="${data.url}" target="_blank">${data.url}</a>)</p>`;
        }
        contentHtml += `<p><strong>Date:</strong> ${data.date}</p>`;
        contentHtml += `<p>${data.explanation}</p>`;
        if (data.copyright) {
            contentHtml += `<p><strong>Copyright:</strong> ${data.copyright}</p>`;
        }
        if (apodContentDiv) apodContentDiv.innerHTML = contentHtml;
    } catch (error) {
        if (apodContentDiv) displayError(apodContentDiv, `Could not fetch APOD: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function setupApodSection() {
    const today = new Date().toISOString().split('T')[0];
    if (apodDateInput) {
        apodDateInput.setAttribute('max', today);
        apodDateInput.value = today;
    }
    fetchAPOD();
    if (fetchApodBtn) {
        fetchApodBtn.onclick = () => {
            fetchAPOD(apodDateInput.value);
        };
    }
}


// Section 3: Asteroid Radar
async function fetchAsteroids(startDate, endDate) {
    showLoading();
    if (asteroidContentDiv) {
        asteroidContentDiv.innerHTML = '<p>> Scanning for threats...</p>';
    }
    
    try {
        const response = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        let allCloseApproachEvents = [];
        for (const date in data.near_earth_objects) {
            data.near_earth_objects[date].forEach(asteroid => {
                asteroid.close_approach_data.forEach(approach => {
                    allCloseApproachEvents.push({
                        name: asteroid.name,
                        nasa_jpl_url: asteroid.nasa_jpl_url,
                        is_potentially_hazardous_asteroid: asteroid.is_potentially_hazardous_asteroid,
                        estimated_diameter: asteroid.estimated_diameter,
                        close_approach_data: approach,
                        relative_velocity_kmh: approach.relative_velocity.kilometers_per_hour
                    });
                });
            });
        }

        let asteroidHtml = '';
        if (allCloseApproachEvents.length > 0) {
            allCloseApproachEvents.sort((a, b) => parseFloat(a.close_approach_data.miss_distance.kilometers) - parseFloat(b.close_approach_data.miss_distance.kilometers));
            
            const closestObject = allCloseApproachEvents[0];

            const minDiameterKm = closestObject.estimated_diameter.kilometers.estimated_diameter_min.toFixed(3); 
            const maxDiameterKm = closestObject.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3);
            
            const missDistanceKm = parseFloat(closestObject.close_approach_data.miss_distance.kilometers).toLocaleString(undefined, { maximumFractionDigits: 0 }); 
            const relativeVelocityKmh = parseFloat(closestObject.relative_velocity_kmh).toLocaleString(undefined, { maximumFractionDigits: 0 });

            const approachDateTime = new Date(closestObject.close_approach_data.close_approach_date_full);
            const year = approachDateTime.getFullYear();
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = monthNames[approachDateTime.getMonth()];
            const day = String(approachDateTime.getDate()).padStart(2, '0');
            const hours = String(approachDateTime.getHours()).padStart(2, '0');
            const minutes = String(approachDateTime.getMinutes()).padStart(2, '0');
            const formattedApproach = `${year}-${month}-${day} ${hours}:${minutes}`;
            
            asteroidHtml += `
                <p>> ANALYSIS COMPLETE. CLOSEST OBJECT DETECTED:</p>
                <p>> Name: <a href="${closestObject.nasa_jpl_url}" target="_blank">${closestObject.name}</a></p>
                <p>> Potentially Hazardous: ${closestObject.is_potentially_hazardous_asteroid ? 'true' : 'false'}</p>
                <p>> Est. Diameter (km): ${minDiameterKm} - ${maxDiameterKm}</p>
                <p>> Closest Approach: ${formattedApproach}</p>
                <p>> Miss Distance (km): ${missDistanceKm}</p>
                <p>> Relative Velocity (km/h): ${relativeVelocityKmh}</p>
            `;
        } else {
            asteroidHtml = '<p>> No near-Earth objects detected within the specified date range.</p>';
        }
        if (asteroidContentDiv) asteroidContentDiv.innerHTML = asteroidHtml;

    } catch (error) {
        if (asteroidContentDiv) displayError(asteroidContentDiv, `Could not fetch asteroid data: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function setupAsteroidSection() {
    const today = new Date();
    const defaultStartDate = new Date(today);
    defaultStartDate.setDate(today.getDate() - 2);
    const defaultEndDate = new Date(today);

    if (asteroidStartDateInput && asteroidEndDateInput) {
        asteroidStartDateInput.value = defaultStartDate.toISOString().split('T')[0];
        asteroidEndDateInput.value = defaultEndDate.toISOString().split('T')[0];

        asteroidStartDateInput.setAttribute('max', today.toISOString().split('T')[0]);
        asteroidEndDateInput.setAttribute('max', today.toISOString().split('T')[0]);
    }

    if (asteroidContentDiv) asteroidContentDiv.innerHTML = '<p class="system-message">> System ready. Select date range for threat analysis.</p>';

    if (fetchAsteroidsBtn) {
        fetchAsteroidsBtn.onclick = () => {
            const start = asteroidStartDateInput.value;
            const end = asteroidEndDateInput.value;

            if (start && end) {
                const date1 = new Date(start);
                const date2 = new Date(end);
                const diffTime = Math.abs(date2 - date1);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays > 7 || diffDays < 0 || date1 > date2) {
                    if (asteroidContentDiv) asteroidContentDiv.innerHTML = '<p class="error-message">> Error: Date range cannot exceed 7 days and end date must be on or after start date.</p>';
                    return;
                }
                fetchAsteroids(start, end);
            } else {
                if (asteroidContentDiv) asteroidContentDiv.innerHTML = '<p class="error-message">> Error: Please select both start and end dates.</p>';
            }
        };
    }
}


// Section 4: Space Weather
async function fetchDonkiEvents(date) {
    showLoading();
    if (donkiContentDiv) donkiContentDiv.innerHTML = '<p>Observing solar activity...</p>';
    const queryDate = new Date(date);
    const endDate = new Date(queryDate);
    endDate.setDate(queryDate.getDate() + 1); 
    const formattedEndDate = endDate.toISOString().split('T')[0];

    try {
        const flaresResponse = await fetch(`https://api.nasa.gov/DONKI/FLR?startDate=${date}&endDate=${formattedEndDate}&api_key=${NASA_API_KEY}`);
        const cmeResponse = await fetch(`https://api.nasa.gov/DONKI/CME?startDate=${date}&endDate=${formattedEndDate}&api_key=${NASA_API_KEY}`);
        
        if (!flaresResponse.ok) throw new Error(`Flares HTTP error! status: ${flaresResponse.status}`);
        if (!cmeResponse.ok) throw new Error(`CME HTTP error! status: ${cmeResponse.status}`);
        
        const flares = await flaresResponse.json();
        const cmes = await cmeResponse.json();

        let eventHtml = `<h3>Solar Activity on/around ${formatDate(date)}</h3>`;
        let hasEvents = false;

        eventHtml += `
            <div class="donki-category">
                <h4>Solar Flares <span class="category-icon">⚡</span></h4>
                <div class="event-list">
        `;
        if (flares && flares.length > 0) {
            hasEvents = true;
            flares.forEach(flare => {
                eventHtml += `
                    <div class="donki-event-card flare">
                        <p><strong>Class:</strong> <span class="highlight-class">${flare.classType || 'N/A'}</span></p>
                        <p><strong>Begin:</strong> ${formatTime(flare.beginTime)}</p>
                        <p><strong>Peak:</strong> ${formatTime(flare.peakTime)}</p>
                        <p><strong>End:</strong> ${formatTime(flare.endTime)}</p>
                        <p><strong>Source:</strong> ${flare.sourceLocation || 'N/A'}</p>
                        <p><strong>Active Region:</strong> ${flare.activeRegionNum || 'N/A'}</p>
                        ${flare.link ? `<p><a href="${flare.link}" target="_blank">View Details</a></p>` : ''}
                    </div>
                `;
            });
        } else {
            eventHtml += `<p class="no-events-message">No significant solar flares detected.</p>`;
        }
        eventHtml += `
                </div>
            </div>
        `;

        // Coronal Mass Ejections Section
        eventHtml += `
            <div class="donki-category">
                <h4>Coronal Mass Ejections <span class="category-icon">💥</span></h4>
                <div class="event-list">
        `;
        if (cmes && cmes.length > 0) {
            hasEvents = true;
            cmes.forEach(cme => {
                const latestAnalysis = cme.cmeAnalyses ? cme.cmeAnalyses[cme.cmeAnalyses.length - 1] : null;
                const speed = latestAnalysis && latestAnalysis.speed ? `${latestAnalysis.speed} km/s` : 'N/A';
                const halfAngle = latestAnalysis && latestAnalysis.halfAngle ? `${latestAnalysis.halfAngle}°` : 'N/A';
                const type = latestAnalysis && latestAnalysis.type ? latestAnalysis.type : 'N/A';
                const instruments = cme.instruments && cme.instruments.length > 0 ? cme.instruments.map(i => i.displayName).join(', ') : 'N/A';
                const note = cme.note || 'No additional notes.';

                eventHtml += `
                    <div class="donki-event-card cme">
                        <p><strong>Start Time:</strong> ${formatTime(cme.startTime)}</p>
                        <p><strong>Speed:</strong> <span class="highlight-speed">${speed}</span></p>
                        <p><strong>Half Angle:</strong> ${halfAngle}</p>
                        <p><strong>Type:</strong> ${type}</p>
                        <p><strong>Instrument(s):</strong> ${instruments}</p>
                        <p class="event-note">Note: ${note}</p>
                        ${cme.link ? `<p><a href="${cme.link}" target="_blank">View Details</a></p>` : ''}
                    </div>
                `;
            });
        } else {
            eventHtml += `<p class="no-events-message">No Coronal Mass Ejections detected.</p>`;
        }
        eventHtml += `
                </div>
            </div>
        `;

        if (donkiContentDiv) donkiContentDiv.innerHTML = eventHtml;

    } catch (error) {
        if (donkiContentDiv) displayError(donkiContentDiv, `Could not fetch DONKI data: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function setupDonkiSection() {
    const today = new Date();
    const defaultDate = new Date(today);
    defaultDate.setDate(defaultDate.getDate() - 1); 
    
    if (donkiDateInput) {
        donkiDateInput.value = defaultDate.toISOString().split('T')[0];
        donkiDateInput.setAttribute('max', today.toISOString().split('T')[0]);
    }

    if (donkiDateInput) fetchDonkiEvents(donkiDateInput.value);

    if (fetchDonkiBtn) {
        fetchDonkiBtn.onclick = () => {
            const date = donkiDateInput.value;
            if (date) {
                fetchDonkiEvents(date);
            } else {
                if (donkiContentDiv) donkiContentDiv.innerHTML = '<p class="error-message">Please select a date.</p>';
            }
        };
    }
}


// Section 5: EPIC Earth Images
async function fetchEPICImages(dateString) {
    showLoading();
    if (epicContentDiv) epicContentDiv.innerHTML = '<p>Fetching Earth\'s portrait...</p>';
    try {
        const dateParts = dateString.split('-');
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];

        const metadataResponse = await fetch(`https://api.nasa.gov/EPIC/api/natural/date/${dateString}?api_key=${NASA_API_KEY}`);
        
        if (!metadataResponse.ok) {
            if (metadataResponse.status === 404) {
                 throw new Error(`No EPIC images found for ${dateString}. EPIC images are captured once daily. Try recent dates.`);
            }
            throw new Error(`HTTP error! status: ${metadataResponse.status}`);
        }
        const data = await metadataResponse.json();

        if (data && data.length > 0) {
            const image = data[data.length -1];
            const imageName = image.image;
            const caption = image.caption;
            const centroidCoordinates = image.centroid_coordinates;
            const dateTaken = new Date(image.date).toLocaleString();

            const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/png/${imageName}.png`;

            if (epicContentDiv) {
                epicContentDiv.innerHTML = `
                    <h3>Earth's Daily Portrait from ${dateString}</h3>
                    <img src="${imageUrl}" alt="EPIC Earth Image">
                    <p><strong>Captured:</strong> ${dateTaken} UTC</p>
                    <p><strong>Caption:</strong> ${caption || 'N/A'}</p>
                    <p><strong>Image Center:</strong> Lat ${centroidCoordinates.lat.toFixed(2)}°, Lon ${centroidCoordinates.lon.toFixed(2)}°</p>
                    <p><small>Image provided by the DSCOVR satellite, a partnership between NASA, NOAA, and the U.S. Air Force.</small></p>
                `;
            }
        } else {
            if (epicContentDiv) epicContentDiv.innerHTML = `<p>No EPIC Earth images found for ${dateString}. Please try another recent date.</p>`;
        }
    } catch (error) {
        if (epicContentDiv) displayError(epicContentDiv, `Could not fetch EPIC images: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function setupEPICSection() {
    const today = new Date();
    const defaultDate = new Date(today);
    defaultDate.setDate(today.getDate() - 2); 
    
    if (epicDateInput) {
        epicDateInput.value = defaultDate.toISOString().split('T')[0];
        epicDateInput.setAttribute('max', today.toISOString().split('T')[0]);
    }

    if (epicDateInput) fetchEPICImages(epicDateInput.value);

    if (fetchEpicImagesBtn) {
        fetchEpicImagesBtn.onclick = () => {
            const date = epicDateInput.value;
            if (date) {
                fetchEPICImages(date);
            } else {
                if (epicContentDiv) epicContentDiv.innerHTML = '<p class="error-message">Please select a date.</p>';
            }
        };
    }
}


// --- Page Routing / Initialization Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const filename = path.split('/').pop();

    if (filename === 'index.html' || filename === '' || filename === 'index.html') {
        if (episodeCards.length > 0) {
            episodeCards.forEach(card => {
                card.addEventListener('click', () => {
                    clearAllIntervals();
                    window.location.href = card.dataset.target;
                });
            });
        }
        if (header) header.classList.add('hidden-back-button');
    } 
    else {
        if (header) header.classList.remove('hidden-back-button');
        if (backToHomeBtn) {
            backToHomeBtn.addEventListener('click', () => {
                clearAllIntervals();
                window.location.href = 'index.html';
            });
        }

        if (filename === 'mars.html') {
            setupMarsRoverSection();
        } else if (filename === 'apod.html') {
            setupApodSection();
        } else if (filename === 'asteroids.html') {
            setupAsteroidSection();
        } else if (filename === 'space-weather.html') {
            setupDonkiSection();
        } else if (filename === 'epic.html') {
            setupEPICSection();
        }
    }
});
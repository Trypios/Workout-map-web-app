
export default class BrowserController {

    #htmlElements = {
        map: L.map('map'),
        form: document.querySelector('.form'),
        inputType: document.querySelector('.form__input--type'),
        inputDistance: document.querySelector('.form__input--distance'),
        inputDuration: document.querySelector('.form__input--duration'),
        inputCadence: document.querySelector('.form__input--cadence'),
        inputElevation: document.querySelector('.form__input--elevation'),
        containerWorkouts: document.querySelector('.workouts')
    };
    
    #config = {
        mapZoomLevel: 13,
        markerDefaultType: 'leaflet',
        runningFigures: { icon: '🏃‍♂️', timeIcon: '⏱', speedIcon: '⚡️',
                          speedUnit: 'min/km', effortIcon: '🦶🏼', effortUnit: 'spm' },
        cyclingFigures: { icon: '🚴‍♀️', timeIcon: '⏱', speedIcon: '⚡️',
                          speedUnit: 'km/hour', effortIcon: '⛰', effortUnit: 'm' }
    }

    constructor() {}

    /**
     * Getter.
     * @returns Leaflet map
     */
    getMap() {
        return this.#htmlElements.map;
    }

    /**
     * Getter.
     * @returns Object containing DOM elements of interest.
     */
    htmlElements() {
        return this.#htmlElements;
    }

    /**
     * Render map in HTML, focused on user's lat, lng coordinates.
     * @param {Object} coords  // lat, lng
     */
    renderMap(coords) {
        // https://www.google.com/maps/@35.1600642,33.4036992
        this.getMap().setView(coords, this.#config.mapZoomLevel);
    
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: `&copy; 
                          <a href="https://www.openstreetmap.org/copyright">
                            OpenStreetMap
                          </a>
                          contributors`
        }).addTo(this.getMap());
    }

    /**
     * Center the map to the specified coordinates.
     * @param {Object} coords // lat, lng
     */
    reCenter(coords) {
        this.getMap().setView(coords, this.#config.mapZoomLevel);
    }

    /**
     * Render new marker on the map.
     * @param {Object} coords  // lat, lng
     * @param {String} msg 
     * @returns map Marker element.
     */
    renderMarker(coords, htmlContent, markerType=null) {
        coords = [coords.lat, coords.lng];
        markerType = markerType == null ? this.#config.markerDefaultType : markerType;
        const popup = L.popup(
            { maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false, 
              className: `${markerType}-popup` })
        .setContent(htmlContent);
    
        const marker = L.marker(coords, { draggable: true })
            .addTo(this.getMap())
            .bindPopup(popup)
            .openPopup();
    
        return marker;
    }

    /**
     * Render new workout marker on the map.
     * @param {Workout} wrk 
     * @returns map Marker element.
     */
    renderWorkoutMarker(wrk) {
        const action = wrk.constructor.name;  // "Running" or "Cycling"
        const htmlContent = `<p>${action} on ${wrk.getDate()}</p>`;
        return this.renderMarker(wrk.coords, htmlContent, wrk.type);
    }

    
    /**
     * Render workout session on relevant section of app's left panel.
     * @param {Workout} wrk 
     */
    renderWorkout(wrk) {
        const action = wrk.constructor.name;  // "Running" or "Cycling"
        const figures = (wrk.type === "running") ? this.#config.runningFigures
                                                 : this.#config.cyclingFigures;
        const html = `
        <li class="workout workout--${wrk.type}" data-id=${wrk.id}>
            <button class="workout--del">x</button>
            <h2 class="workout__title">${action} on ${wrk.getDate(true)}</h2>
            <div class="workout__details">
                <span class="workout__icon">${figures.icon}</span>
                <span class="workout__value">${wrk.distance}</span>
                <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">${figures.timeIcon}</span>
                <span class="workout__value">${wrk.duration}</span>
                <span class="workout__unit">minutes</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">${figures.speedIcon}</span>
                <span class="workout__value">${wrk.getSpeed()}</span>
                <span class="workout__unit">${figures.speedUnit}</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">${figures.effortIcon}</span>
                <span class="workout__value">${wrk.getEffort()}</span>
                <span class="workout__unit">${figures.effortUnit}</span>
            </div>
        </li>`
        this.#htmlElements.form.insertAdjacentHTML('afterend', html);
    }

    /**
     * Remove workout element from left panel.
     * @param {Element} wrkElem - Html element. 
     */
    removeWorkoutElem(wrkElem) {
        wrkElem.remove();
    }

    /**
     * Remove marker from map.
     * @param {Marker} marker - Leaflet marker. 
     */
    removeMarker(marker) {
        marker.remove();
    }

    /**
     * Center map to selected marker.
     * @param {Marker} marker - Leaflet marker. 
     */
    _moveToMarker(marker) {
        console.log(marker);
    }

    /**
     * Display input form in HTML.
     */
    showForm() {
        this.#htmlElements.form.classList.remove('hidden');
        this.#htmlElements.inputDistance.focus();
    }

    /**
     * Hide input form in HTML.
     */
    hideForm() {
        this.#htmlElements.form.classList.add('hidden');
    }

    /**
     * Get data from HTML form.
     * @returns object.
     */
    getFormValues() {
        const elements = this.htmlElements();
        return { type : elements.inputType.value,
                 // '+' operand implicitly casts String to Number
                 distance : + elements.inputDistance.value,
                 duration : + elements.inputDuration.value,
                 cadence : + elements.inputCadence.value,
                 elevationGain: + elements.inputElevation.value};
    }
}

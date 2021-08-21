
import { AppBrowser } from './browser.js';
import { AppData } from './data.js';


export class AppCtrl {
    constructor() {
        this.dataCtrl = new AppData();
        this.browserCtrl = new AppBrowser();
    }
    
    /**
     * Initialize controller and app's event listeners.
     */
    async run() {
        await this._initMap();
        this._initWorkouts();
        this._setMapClickListener();
        this._setTypeChangeEL();
        this._setWorkoutsEL();
    }

    /**
     * Initialize map according to user's coordinates.
     * Gets user's coordinates (lat, lng) by geologation
     * or by IP if former method fails.
     */
     async _initMap() {
        const ip_coordinates = await this.dataCtrl.getPosByIP();
        let coords;
        if (ip_coordinates) {
            coords = ip_coordinates;
            this.browserCtrl.renderMap(ip_coordinates);  // temp rendering
        }
        let geo_coordinates;
        try {
            let data = await this.dataCtrl.getPosByGeoloc();
            geo_coordinates = { lat: data.coords.latitude, 
                                lng: data.coords.longitude };
        } catch (err) {
            if (!ip_coordinates) throw Error("Map cannot be set");
            console.error("Geolocation rejected, keeping IP position"), err;
        }
        if (geo_coordinates) {
            coords = geo_coordinates;
            this.browserCtrl.renderMap(geo_coordinates);
        }
        this.browserCtrl.renderMarker(coords, '<p>Current location</p>');
    }

    /**
     * Reload and re-render all Workouts saved in localStorage.
     */
    _initWorkouts() {
        this.dataCtrl.getWorkouts().forEach(wrk => {
            const marker = this.browserCtrl.renderWorkoutMarker(wrk);
            this.browserCtrl.renderWorkout(wrk);
            wrk.setMarker(marker);
        });
    }

    /**
     * Set map listener. The handler checks for mouse clicks to:
     *  - add a marker on the clicked point
     *  - display the form
     */
    _setMapClickListener() {
        const map = this.browserCtrl.getMap();
        const addNewWorkout = (mapEvent) => {
            // display form and temporarily disable map listener
            this.browserCtrl.showForm();
            map.off('click', addNewWorkout);
            // add temporary marker
            const type = this.browserCtrl.getFormValues().type;
            const tempMarker = this.browserCtrl.renderMarker(
                mapEvent.latlng, 
                `<p><u>${type}</u> <br/>--info pending--</p>`
            );
            // then listen for input to replace tempMarker
            this._setFormSubmitEL(tempMarker);
            };
        map.on('click', addNewWorkout);
    }

    /**
     * Helper function.
     * Set one-off event listener on the form's submission.
     * Changes the latest map marker's info according to input data.
     */
    _setFormSubmitEL(tempMarker) {
        const form = this.browserCtrl.htmlElements().form;
        const updateMarkerInfo = (event) => {
            event.preventDefault();
            // hide form and temporarily disable form listener
            this.browserCtrl.hideForm();
            form.removeEventListener('submit', updateMarkerInfo);
            // get data from HTML form, create Workout and render correct marker
            const coords = tempMarker.getLatLng();
            const data = this.browserCtrl.getFormValues();
            const currentWorkout = this.dataCtrl.createWorkout(coords, data);
            this.browserCtrl.removeMarker(tempMarker);
            const currentMarker = this.browserCtrl.renderWorkoutMarker(currentWorkout);
            currentWorkout.setMarker(currentMarker);
            this.browserCtrl.renderWorkout(currentWorkout);
            this.browserCtrl.reCenter(coords);
            // re-enable map listener
            this._setMapClickListener();
        };
        form.addEventListener('submit', updateMarkerInfo);
    };

    /**
     * Set event listener on the form's type input.
     * Toggles the relevant 4th input box (cadence / elevation).
     */
    _setTypeChangeEL() {
        const { inputType, 
            inputCadence, 
            inputElevation } = this.browserCtrl.htmlElements();
        inputType.addEventListener('change', function(e) {
            e.preventDefault();
            [inputCadence, inputElevation].forEach(el => 
                el.closest('.form__row').classList.toggle('form__row--hidden'));
        });
    }

    /**
     * Set event listener on the workout blocks on the left panel.
     * Re-centers the map to the clicked workout's associated marker.
     */
    _setWorkoutsEL() {
        const workoutsContainer = this.browserCtrl.htmlElements().containerWorkouts;
        const moveToPopup = (event) => {
            const wrkElem = event.target.closest('.workout');
            if (!wrkElem) return;
            const workout = this.dataCtrl.findWorkout(Number(wrkElem.dataset.id));
            if (!workout) { console.error('Workout not found'); return; }
            const coords = workout.getMarker().getLatLng();
            this.browserCtrl.reCenter(coords);
        }
        workoutsContainer.addEventListener('click', moveToPopup);
    }

    // IMPLEMENT delete workout
    // IMPLEMENT delete all workouts
}

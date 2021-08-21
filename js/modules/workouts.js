
/**
 * Abstract class.
 */
class Workout {

    type = '';
    #months = ['January', 'February', 'March', 'April', 
              'May', 'June', 'July', 'August', 
              'September', 'October', 'November', 'December'];

    constructor(coords, distance, duration, id) {
        if (this.constructor === Workout) {
            throw new Error("Abstract class");
        }
        this.coords = coords;  // lat, lng
        this.distance = distance;  // in km
        this.duration = duration;  // in min
        this.date = this._currentDate();
        this.id = id;
        this.marker = null;
    }

    /**
     * Calculate the current date (day of month, month, year).
     * @returns object
     */
    _currentDate() {
        const date = new Date();
        return {day: date.getDate(),
                month: this.#months[date.getMonth()],
                year: date.getFullYear()};
    }

    /**
     * Getter of Workout's date
     * string-formatted as "MMM D, YYYY".
     * @param {Boolean} year 
     * @returns String
     */
    getDate(year=false) {
        const d = this.date;
        let result = `${d.month} ${d.day}`;
        if (year) result += `, ${d.year}`;
        return result;
    }

    /**
     * Each Workout object may be linked with its 
     * associated marker on the map.
     * @param marker - Leaflet Marker object
     */
    setMarker(marker) {
        this.marker = marker;
    }

    /**
     * Getter of linked associated map marker.
     * @returns Leaflet Marker object
     */
    getMarker() {
        return this.marker;
    }

    /**
     * Deserialize json to Workout object (Running or Cycling).
     * @param {Object} json 
     * @returns Workout object
     */
    static fromJson(json) {
        let workout;
        try {
            if (json.type === "running") {
                workout = new Running(json.coords, 
                                   json.distance, 
                                   json.duration, 
                                   json.cadence, 
                                   json.id);
            } else if (json.type === "cycling") {
                workout = new Cycling(json.coords, 
                                      json.distance, 
                                      json.duration, 
                                      json.elevationGain, 
                                      json.id);
            }
        } catch (ignored) {}
        return workout;
    }
}

class Running extends Workout {

    type = 'running';

    constructor(coords, distance, duration, cadence, id=Date.now()) {
        super(coords, distance, duration, id);
        this.cadence = cadence;  // strides
        this.pace = this._calcPace();  // min per km
    }

    /**
     * Pace = time (minutes) / distance (km).
     */
    _calcPace() {
        let pace = this.duration / this.distance;
        return pace;
    }

    /**
     * Getter of pace rounded to 2 d.p.
     * @returns String.
     */
    getSpeed() {
        return this.pace.toFixed(1);
    }

    /**
     * Getter of running cadence, in strides per minute.
     * @returns Number.
     */
    getEffort() {
        return this.cadence;
    }
}

class Cycling extends Workout {

    type = 'cycling';

    constructor(coords, distance, duration, elevationGain, id=Date.now()) {
        super(coords, distance, duration, id);
        this.elevationGain = elevationGain;  // meters
        this.speed = this._calcSpeed();  // km per hour
    }

    /**
     * Speed = distance (km) / time (hours).
     */
    _calcSpeed() {
        let speed = this.distance / (this.duration / 60);
        return speed;
    }

    /**
     * Getter of speed rounded to 2 d.p.
     * @returns String.
     */
    getSpeed() {
        return this.speed.toFixed(2)
    }

    /**
     * Getter of elevation gain.
     * @returns Number.
     */
    getEffort() {
        return this.elevationGain;
    }
}

export { Workout, Running, Cycling };


import { Workout, Running, Cycling } from './workouts.js';


export class AppData {

    #workouts = [];

    constructor() {
        this.loadWorkouts();
    }

    /**
     * Getter.
     * @returns Array
     */
    getWorkouts() {
        return this.#workouts;
    }

    /**
     * Create an instance of a Workout subclass (Running or Cycling).
     * @param {Object} coords  // lat, lng
     * @param {Object} data 
     * @returns Workout object
     */
     createWorkout(coords, data) {
        let workout;
        const { distance, duration, cadence, elevationGain} = data;
        if (data.type === "running") {
            workout = new Running(coords, distance, duration, cadence);
        } else if (data.type === "cycling") {
            workout = new Cycling(coords, distance, duration, elevationGain);
        }
        this.saveWorkout(workout);
        return workout;
    }

    /**
     * Find a Workout object by ID.
     * @param {Number} id 
     * @returns Workout object
     */
    findWorkout(id) {
        return this.#workouts.find(w => w.id === id);
    }

    /**
     * Promisified geolocation positioning.
     * @returns a Promise to resolve coordinates (object).
     */
    async getPosByGeoloc() {
       return new Promise(function(resolve, reject) {
           const options = {
               maximumAge: 60000, 
               timeout: 5000, 
               enableHighAccuracy: true
           }
           window.navigator.geolocation.getCurrentPosition(
               resolve, reject, options
            );
       });
    }

    /**
     * Promisified IP positioning.
     * @returns a Promise to resolve coordinates (object).
     */
    async getPosByIP () {
        try {
            const response = await fetch('http://ip-api.com/json/');
            const jsonData = await response.json();
            const coords = {
                lat: jsonData.lat, 
                lng: jsonData.lon
            };
            return Promise.resolve(coords);
        } catch (err) {
            return Promise.reject(false);
        }
    }

    /**
     * Append a workout to #Workouts and
     * save to localStorage.
     * @param {Workout} wrk
     */
    saveWorkout(wrk) {
        this.#workouts.push(wrk);
        window.localStorage.setItem(wrk.id, JSON.stringify(wrk));
    }

    /**
     * Load and deserialize all workouts from localStorage.
     * @returns array of Workout objects (Running or Cycling).
     */
    loadWorkouts() {
        let keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }
        keys = keys.sort();
        let item, json, wrk;
        keys.forEach(k => {
            item = localStorage.getItem(k);
            json = JSON.parse(item);
            wrk = Workout.fromJson(json);
            this.#workouts.push(wrk);
        });
        return this.#workouts;
    }
}

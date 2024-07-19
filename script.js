'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const list = document.querySelector('.list');
const listBtn = document.querySelector('.list-btn');

class Workout {
  id = (Date.now() + '').slice(-10);
  date = new Date();
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.name[0].toUpperCase()}${this.name.slice(1)} ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
    return this.description;
  }
}

class Running extends Workout {
  name = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this.setDescription();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  name = 'cycling';
  constructor(coords, distance, duration, elevGain) {
    super(coords, distance, duration);
    this.elevGain = elevGain;
    this.calcSpeed();
    this.setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

class App {
  #workouts = [];
  #map;
  #mapEvent;
  #zoomLevel = 15;
  constructor() {
    this.#getPosition();
    form.addEventListener('submit', this.#newWorkout.bind(this));
    inputType.addEventListener('change', this.#toggleType);
    listBtn.addEventListener('click', this.#handleBtn.bind(this));
  }

  #listBtnHandler() {
    if (list.classList.contains('list--hidden')) {
      listBtn.textContent = 'Show list';
      return true;
    } else {
      listBtn.textContent = 'Hide list';
      return false;
    }
  }
  #handleList(state) {
    list.classList[state]('list--hidden');
  }

  #handleForm(state) {
    if (state === 'add') {
      form.style.display = 'none';
      form.classList[state]('hidden');
      setTimeout(() => (form.style.display = 'grid'), 1000);
    } else {
      form.classList[state]('hidden');
    }
  }

  #getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.#loadMap.bind(this),
        function () {
          alert("Couldn't get your position.");
        }
      );
    }
  }

  #loadMap(position) {
    const { latitude, longitude } = position.coords;
    //setting view of the map in current position(L=leaflet library)
    this.#map = L.map('map').setView([latitude, longitude], this.#zoomLevel);

    //adding layer to map. we also have ....org/{z}/...
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //instead of eventlistener on the map
    this.#map.on('click', this.#showForm.bind(this));
    this.#map.on('movestart', this.#hideForm.bind(this));
  }

  #showForm(mapE) {
    this.#mapEvent = mapE;
    //show form part
    this.#handleForm('remove');
    //rendering workout form
    this.#handleList('remove');
    setTimeout(() => inputDistance.focus(), 100); //good to ux
    //check classes for show/hide list btn
    this.#listBtnHandler();
    this.#clearInputs();
  }

  #hideForm() {
    this.#handleList('add');
    this.#handleForm('add');
    this.#listBtnHandler();
  }

  #newWorkout(e) {
    e.preventDefault();
    //validating form inputs then show them on map
    let workout;
    const workoutType = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    const coords = [lat, lng];

    const validateInputs = (...inputs) =>
      inputs.every(input => Number.isFinite(input));

    const allPositive = (...inputs) => inputs.every(input => input > 0);

    if (workoutType === 'running') {
      const cadence = +inputCadence.value;
      if (
        !validateInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert('Enter positive numbers...');
      }
      workout = new Running(coords, distance, duration, cadence);
      this.#workouts.push(workout);
    }
    if (workoutType === 'cycling') {
      const elevGain = +inputElevation.value;
      if (
        !validateInputs(distance, duration, elevGain) ||
        !allPositive(distance, duration)
      ) {
        return alert('Enter positive number for distance and duration...');
      }
      workout = new Cycling(coords, distance, duration, elevGain);
      this.#workouts.push(workout);
    }

    this.#renderWorkoutOnMap(workout);

    //clearing inputs
    this.#clearInputs();

    this.#handleForm('add');
    this.#handleList('add');
    this.#listBtnHandler();
  }

  #clearInputs() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  #renderWorkoutOnMap(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: '350',
          autoClose: false,
          // closeButton: false,
          closeOnClick: false,
          closeOnEscapeKey: false,
          className:
            workout.name === 'running' ? 'running-popup' : 'cycling-popup',
        })
      )
      .setPopupContent(
        `${workout.name === 'running' ? '🏃‍♂️' : '🚴‍♂️'} ${workout.description}`
      )
      .openPopup();
  }

  #toggleType() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputDistance.focus();
  }

  #handleBtn() {
    if (this.#listBtnHandler()) {
      this.#handleList('remove');
      this.#listBtnHandler();
    } else {
      this.#handleList('add');
      this.#handleForm('add');
      this.#listBtnHandler();
    }
  }
}
const app = new App();

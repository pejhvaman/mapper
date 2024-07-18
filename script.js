'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const list = document.querySelector('.list');
const listBtn = document.querySelector('.list-btn');

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
  }

  #hideForm() {
    this.#handleList('add');
    this.#handleForm('add');
    this.#listBtnHandler();
  }

  #newWorkout(e) {
    e.preventDefault();
    //validating form inputs then show them on map
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: '250',
          autoClose: false,
          // closeButton: false,
          closeOnClick: false,
          closeOnEscapeKey: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('workout')
      .openPopup();
    //clearing inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    this.#handleForm('add');
    this.#handleList('add');
    this.#listBtnHandler();
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

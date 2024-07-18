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

if (navigator.geolocation) {
  //async
  let map,
    mapEvent,
    zoomLevel = 15;
  const listBtnHandler = function () {
    if (list.classList.contains('list--hidden')) {
      listBtn.textContent = 'Show list';
      return true;
    } else {
      listBtn.textContent = 'Hide list';
      return false;
    }
  };

  //helper functions
  const handleList = state => list.classList[state]('list--hidden');
  const handleForm = state => {
    if (state === 'add') {
      form.style.display = 'none';
      form.classList[state]('hidden');
      setTimeout(() => (form.style.display = 'grid'), 1000);
    } else {
      form.classList[state]('hidden');
    }
  };

  //getting current position
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude, longitude } = position.coords;
      //setting view of the map in current position(L=leaflet library)
      map = L.map('map').setView([latitude, longitude], zoomLevel);

      //adding layer to map. we also have ....org/{z}/...
      L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      //instead of eventlistener on the map
      map.on('click', function (mapE) {
        mapEvent = mapE;
        //show form part
        handleForm('remove');
        //rendering workout form
        handleList('remove');
        setTimeout(() => inputDistance.focus(), 100); //good to ux
        //check classes for show/hide list btn
        listBtnHandler();
      });

      map.on('movestart', function () {
        handleList('add');

        handleForm('add');

        listBtnHandler();
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        //validating form inputs then show them on map
        const { lat, lng } = mapEvent.latlng;
        L.marker([lat, lng])
          .addTo(map)
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
        handleForm('add');
        handleList('add');
        listBtnHandler();
      });

      inputType.addEventListener('change', function () {
        inputCadence
          .closest('.form__row')
          .classList.toggle('form__row--hidden');
        inputElevation
          .closest('.form__row')
          .classList.toggle('form__row--hidden');
        inputDistance.focus();
      });

      listBtn.addEventListener('click', function () {
        if (listBtnHandler()) {
          handleList('remove');
          listBtnHandler();
        } else {
          handleList('add');
          handleForm('add');
          listBtnHandler();
        }
      });
    },
    function () {
      alert("Couldn't get your position.");
    }
  );
}

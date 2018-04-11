const axios = require('axios')
const QueryString = require('query-string')
const endpoint = '/api'

module.exports = {
  getStates: () => {
    const encodedURI = window.encodeURI(`${endpoint}/states`);
    return axios.get(encodedURI)
    .then(function (response) {
      return response.data;
    });
  },

  getLocations: (state) => {
    const encodedURI = window.encodeURI(`${endpoint}/locations?state=${state}`);
    return axios.get(encodedURI)
    .then(function (response) {
      return response.data;
    });
  },

  getLocationMatches: (startLocationId, endLocationId, gender) => {
    const params = {
      startLocationId,
      endLocationId,
      gender
    }
    const queryString = QueryString.stringify(params)
    const encodedURI = window.encodeURI(`${endpoint}/carpool/match?${queryString}`);
    return axios.get(encodedURI)
    .then(function (response) {
      return response.data;
    });
  },

  submitCarpoolOffer: (params) => {
    const encodedURI = window.encodeURI(`${endpoint}/carpool/offer`);
    return axios.post(encodedURI, params, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },

  getMyOffers: () => {
    const encodedURI = window.encodeURI(`${endpoint}/carpool/my-offers`);
    return axios.get(encodedURI)
    .then(function (response) {
      return response.data;
    });
  },

  hideOffer: (id) => {
    const encodedURI = window.encodeURI(`${endpoint}/carpool/offer/${id}/hide`);
    return axios.post(encodedURI, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  unhideOffer: (id) => {
    const encodedURI = window.encodeURI(`${endpoint}/carpool/offer/${id}/unhide`);
    return axios.post(encodedURI, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
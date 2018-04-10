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

  getLocationMatches: (startLocationId, endLocationId) => {
    const params = {
      startLocationId,
      endLocationId
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
  }
}
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

  getLocationMatches: () => {
    const encodedURI = window.encodeURI(`${endpoint}/carpool/matches`);
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

  submitCarpoolNeed: (params) => {
    const encodedURI = window.encodeURI(`${endpoint}/carpool/need`);
    return axios.post(encodedURI, params, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },

  updateCarpoolNeed: (id, params) => {
    const encodedURI = window.encodeURI(`${endpoint}/carpool/need/${id}`);
    return axios.put(encodedURI, params, {
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
  },

  cancelOffer: (id) => {
    const encodedURI = window.encodeURI(`${endpoint}/carpool/offer/${id}/cancel`);
    return axios.post(encodedURI, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },

  getNeed: () => {
    const encodedURI = window.encodeURI(`${endpoint}/carpool/my-need`);
    return axios.get(encodedURI).then(function (response) {
      return response.data;
    });
  },

  getAllOffers: (params) => {
    const queryString = QueryString.stringify(params)
    const encodedURI = `${endpoint}/carpool/offers?${queryString}`
    return axios.get(encodedURI).then(function (response) {
      return response.data;
    });
  },

  getAllNeeds: (params) => {
    const queryString = QueryString.stringify(params)
    const encodedURI = `${endpoint}/carpool/needs?${queryString}`
    return axios.get(encodedURI).then(function (response) {
      return response.data;
    });
  },

}
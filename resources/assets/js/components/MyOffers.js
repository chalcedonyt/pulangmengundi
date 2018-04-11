import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Alert, Row, Col} from 'react-bootstrap'
import CarpoolOffer from './CarpoolOffer'

export default class MyOffers extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offers: []
    }

    this.load = this.load.bind(this)
  }

  componentDidMount() {
    this.load()
  }

  load() {
    api.getMyOffers()
    .then(({offers}) => {
      console.log(offers)
      this.setState({
        offers
      })
    })
  }

  render() {
    return (
      <div>
        <h1>Your carpool offers</h1>
        <Alert bsStyle="info">
          <p>
            <strong>Hide</strong> a carpool offer if you want to stop accepting requests.
          </p>
          <p>
            <strong>Cancel</strong> a carpool offer if you want remove the offer completely.
          </p>
        </Alert>
        <Row>
        {this.state.offers.map((offer, i) => (
          <Col md={6} key={i}>
            <CarpoolOffer onChange={() => { window.location.reload() }} offer={offer} isOwner={true}/>
          </Col>
        ))}
        </Row>
      </div>
    )
  }
}
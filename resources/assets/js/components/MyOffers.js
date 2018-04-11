import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Row, Col} from 'react-bootstrap'
import CarpoolOffer from './CarpoolOffer'

export default class MyOffers extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offers: []
    }
  }

  componentDidMount() {
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
        <Row>
        {this.state.offers.map((offer, i) => (
          <Col md={6} key={i}>
            <CarpoolOffer offer={offer} />
          </Col>
        ))}
        </Row>
      </div>
    )
  }
}
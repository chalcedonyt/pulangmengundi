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
          <h4>What should I do now?</h4>
          <p>You may be contacted by passengers going the same way. If you enabled Facebook as a method of contact, do <strong>actively</strong> check your Friend requests and messages</p>
          <br />
          <br />
          <h4>I can&apos;t take any more messengers</h4>
          <p>
            <strong>Hide</strong> a carpool offer if you want to stop accepting requests.
          </p>
          <br />
          <br />
          <h4>I&apos;ve changed my mind</h4>
          <p>
            <strong>Cancel</strong> a carpool offer if you want remove the offer completely. <strong>Let any passengers you have contacted know about this.</strong>
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
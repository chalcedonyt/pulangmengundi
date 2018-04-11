import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Col, Grid, Panel, Row} from 'react-bootstrap'

export default class CarpoolOffer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offer: props.offer
    }
  }
  render() {
    return (
      <Panel>
        <Panel.Body>
          <img src={this.state.offer.user.avatar_url} />
          {this.state.offer.user.name}
          <div>
            <strong>Leaving from:</strong>
            <p>
              {this.state.offer.location_from.name}, {this.state.offer.location_from.state}
            </p>
            <strong>To:</strong>
            <p>
            {this.state.offer.location_to.name}, {this.state.offer.location_to.state}
            </p>
            <strong>Time:</strong>
            <p>{this.state.offer.leave_at}</p>
            {this.state.offer.gender_preference &&
            <div>
              <strong>Gender preference:</strong>
              <p>{this.state.offer.gender_preference}</p>
            </div>}
            {this.state.offer.information &&
              <div>
                <strong>Additional information:</strong>
                <p>{this.state.offer.information}</p>
              </div>}
          </div>
        </Panel.Body>
        <Panel.Footer>
          <Button bsStyle='success'>Contact</Button>
        </Panel.Footer>
      </Panel>
    )
  }
}
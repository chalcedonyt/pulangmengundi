import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Checkbox, Col, Grid, Row, Panel} from 'react-bootstrap'
import CarpoolOffer from './CarpoolOffer'

export default class MyCarpoolNeedMyCarpoolNeed extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offers: null
    }
  }

  componentDidMount() {
    api.getLocationMatches()
    .then(({offers}) => {
      this.setState({
        offers
      })
    })
  }

  render() {
    return (
      <div>
        <div className="container">
          <Panel>
            <Panel.Heading>Your matches</Panel.Heading>
            <Panel.Body>
              <Grid fluid>
              {this.state.offers && this.state.offers.length > 0 && this.state.offers.map((offer, i) => (
                <Col key={i} md={3}>
                  <CarpoolOffer offer={offer} />
                </Col>
              ))}
              </Grid>
            </Panel.Body>
          </Panel>
        </div>
      </div>
    )
  }
}
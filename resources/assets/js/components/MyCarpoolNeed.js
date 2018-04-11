import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Checkbox, Col, Grid, Row, Panel} from 'react-bootstrap'
import CarpoolOffer from './CarpoolOffer'

export default class MyCarpoolNeedMyCarpoolNeed extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offers: null,
      need: null
    }
  }

  componentDidMount() {
    api.getNeed()
    .then((need) => {
      this.setState({
        need
      }, () => {
        api.getLocationMatches()
        .then(({offers}) => {
          this.setState({
            offers
          })
        })
      })
    })
  }

  render() {
    return (
      <div>
        <div className="container">

          <Panel>
            <Panel.Heading>Your request</Panel.Heading>
            <Panel.Body>
              {this.state.need &&
              <div>
                <strong>Travelling from:</strong>
                <p>{this.state.need.fromLocation.name} ({this.state.need.fromLocation.state})</p>
                <strong>Voting at:</strong>
                <p>{this.state.need.pollLocation.name} ({this.state.need.pollLocation.state})</p>
                <strong>Gender:</strong>
                <p>{this.state.need.gender}</p>
                <strong>Information:</strong>
                <p>{this.state.need.information}</p>
              </div>}
            </Panel.Body>
            <Panel.Footer>
              <Button href='/carpool/need'>Edit</Button>
            </Panel.Footer>
          </Panel>
          <Panel>
            <Panel.Heading>Your matches</Panel.Heading>
            <Panel.Body>
              <Grid fluid>
              {this.state.offers && this.state.offers.length == 0 &&
              <div>
                <p>
                  There is no one matching your travel locations. Check back later!
                </p>
                <p>
                  We will try to match you with anyone travelling from the same states.
                </p>
              </div>
              }
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
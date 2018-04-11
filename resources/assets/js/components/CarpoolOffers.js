import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Col, Grid, Panel, Row} from 'react-bootstrap'
import CarpoolOffer from './CarpoolOffer'

export default class CarpoolOffers extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startLocation: props.startLocation,
      endLocation: props.endLocation,
      gender: props.gender,
      matches: null,
    }
  }

  componentDidMount() {
    api.getLocationMatches(this.state.startLocation.id, this.state.endLocation.id, this.state.gender)
    .then(({matches, partial_matches}) => {
      this.setState({
        matches: matches.concat(partial_matches)
      })
    })
  }

  render() {
    return (
      <Grid fluid>
        <Row className='show-grid'>
          {this.state.matches && this.state.matches.map((match, i) => (
            <Col md={4} xs={6} key={i}>
              <CarpoolOffer offer={match} />
            </Col>
          ))}
        </Row>
      </Grid>
    )
  }
}
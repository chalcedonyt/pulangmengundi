import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Col, DropdownButton, MenuItem, Jumbotron, Row, Panel} from 'react-bootstrap'
import DateSelection from './DateSelection'
import LocationSelection from './LocationSelection'

export default class Selector extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startLocation: null,
      endLocation: null,
      selectedActivity: null,
    }
    this.showActivity = this.showActivity.bind(this)
    this.startLocationChanged = this.startLocationChanged.bind(this)
    this.endLocationChanged = this.endLocationChanged.bind(this)
  }

  startLocationChanged(startLocation) {
    this.setState({
      startLocation
    })
  }

  endLocationChanged(endLocation) {
    this.setState({
      endLocation
    })
  }

  showActivity(selectedActivity) {
    this.setState({
      selectedActivity
    })
  }

  render() {
    return (
      <div>
        <Jumbotron>
          <h1>#PulangMengundi</h1>
          <h3>What do you want to do?</h3>
          <p>
            Choose <strong>offer help</strong> to help subsidize someone's ticket, or to offer a carpool.
          </p>
          <p>
            Choose <strong>need help</strong> if you need a carpool or a subsidy.
          </p>
          <Row>
            <Col md={3} xs={3}>
              <Button bsSize='large' bsStyle='primary' onClick={(e)=>this.showActivity('offer')}>I want to offer help</Button>
            </Col>
            <Col md={3} xs={3}>
              <Button bsSize='large' bsStyle='info' onClick={(e)=>this.showActivity('need')}>I need help</Button>
            </Col>
          </Row>
        </Jumbotron>
        {this.state.selectedActivity == 'offer' &&
        <Jumbotron>
          <p>How would you like to help?</p>
          <Row>
            <Col md={3} xs={3}>
              <Button bsSize='large' bsStyle='primary' href='/offer/carpool'>I want to offer a carpool</Button>
            </Col>
            <Col md={3} xs={3}>
              <Button bsSize='large' bsStyle='info' href='/offer/subsidy'>I want to offer a subsidy</Button>
            </Col>
          </Row>
        </Jumbotron>
        }
        {this.state.selectedActivity == 'need' &&
        <Jumbotron>
          <p>What help do you need?</p>
          <Row>
            <Col md={3} xs={3}>
              <Button bsSize='large' bsStyle='primary' href='/need/carpool'>I need to carpool</Button>
            </Col>
            <Col md={3} xs={3}>
              <Button bsSize='large' bsStyle='info' href='/need/subsidy'>I need a subsidy for a flight/bus/train ticket</Button>
            </Col>
          </Row>
        </Jumbotron>
        }
      </div>
    )
  }
}
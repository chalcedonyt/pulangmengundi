import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Checkbox, Col, DropdownButton, FormControl, MenuItem, Radio, Row, Panel} from 'react-bootstrap'
import DateSelection from './DateSelection'
import LocationSelection from './LocationSelection'

export default class NeedCarpool extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startLocation: null,
      endLocation: null,
      preferredGender: null,
      carpoolQty: 2,

      willCarpoolFromPolls: true,
      willCarpoolToPolls: true,
      carpoolFromPollsDateTime: null,
      carpoolToPollsDateTime: null
    }
    this.startLocationChanged = this.startLocationChanged.bind(this)
    this.endLocationChanged = this.endLocationChanged.bind(this)
    this.handleCarpoolQtyChange = this.handleCarpoolQtyChange.bind(this)
    this.handleGenderChange = this.handleGenderChange.bind(this)
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

  handleCarpoolQtyChange(e) {
    this.setState({
      carpoolQty: e.target.value
    })
  }

  handleGenderChange(preferredGender) {
    this.setState({
      preferredGender
    })
  }

  handleWillCarpoolFromPollsChange() {
    this.setState({
      willCarpoolFromPolls: !this.state.willCarpoolFromPolls
    })
  }

  handleWillCarpoolToPollsChange() {
    this.setState({
      willCarpoolToPolls: !this.state.willCarpoolToPolls
    })
  }

  handleCarpoolFromPollsDateChange(date) {
    this.setState({
      carpoolFromPollsDateTime: date
    })
  }

  handleCarpoolToPollsDateChange(date) {
    this.setState({
      carpoolToPollsDateTime: date
    })
  }

  getValidationState() {
    return this.state.endLocation && this.state.startLocation
  }

  render() {
    return (
      <div>
        <Row>
          <Col md={12} xs={12}>
            <Panel>
              <Panel.Heading componentClass='h4'>Offer to carpool</Panel.Heading>
              <Panel.Body>
                <Row>
                  <Col md={4}>
                    <Panel>
                      <Panel.Heading>
                      <input
                          type="checkbox"
                          onChange={this.handleNeedCarpoolToPollsChange}
                          checked={this.state.needCarpoolToPolls}
                        />&nbsp; I need a carpool to:</Panel.Heading>
                      <Panel.Body>
                        <LocationSelection onChange={this.startLocationChanged}/>
                      </Panel.Body>
                    </Panel>
                  </Col>
                  <Col md={4}>
                    <Panel>
                      <Panel.Heading>
                      <input
                          type="checkbox"
                          onChange={this.handleNeedCarpoolToPollsChange}
                          checked={this.state.needCarpoolToPolls}
                        />&nbsp; I need a carpool back from:</Panel.Heading>
                      <Panel.Body>
                        <LocationSelection onChange={this.endLocationChanged}/>
                      </Panel.Body>
                    </Panel>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Panel>
                      <Panel.Heading>
                      My gender is
                      </Panel.Heading>
                      <Panel.Body>
                        <div>
                          <input
                            type='radio'
                            name='gender'
                            value='male'
                            onChange={(e) => this.handleGenderChange('male')}
                            checked={this.state.preferredGender == 'male'}
                            />Male<br />
                          <input
                            type='radio'
                            name='gender'
                            value='female'
                            onChange={(e) => this.handleGenderChange('female')}
                            checked={this.state.preferredGender == 'female'}
                            />Female<br />
                        </div>
                      </Panel.Body>
                    </Panel>
                  </Col>
                </Row>
              </Panel.Body>
              {this.getValidationState() &&
                <Panel.Footer>
                  <Row>
                    <Col mdOffset={10} md={2}>
                      <Button bsStyle='success'>Submit carpool request</Button>
                    </Col>
                  </Row>
                </Panel.Footer>
              }
            </Panel>
          </Col>
        </Row>
      </div>
    )
  }
}
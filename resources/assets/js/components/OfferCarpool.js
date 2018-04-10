import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Checkbox, Col, DropdownButton, FormControl, MenuItem, Radio, Row, Panel} from 'react-bootstrap'
import DateSelection from './DateSelection'
import LocationSelection from './LocationSelection'

import moment from 'moment'
import axios from 'axios'

export default class OfferCarpool extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startLocation: null,
      endLocation: null,
      preferredGender: null,
      carpoolQty: 2,

      willCarpoolFromPolls: true,
      willCarpoolToPolls: true,
      carpoolFromPollsDateTime: moment('20180509 18', 'YYYYMMDD HH'),
      carpoolToPollsDateTime: moment('20180509 06', 'YYYYMMDD HH'),
    }
    this.startLocationChanged = this.startLocationChanged.bind(this)
    this.endLocationChanged = this.endLocationChanged.bind(this)
    this.handleCarpoolQtyChange = this.handleCarpoolQtyChange.bind(this)
    this.handleGenderChange = this.handleGenderChange.bind(this)
    this.handleCarpoolFromPollsDateChange = this.handleCarpoolFromPollsDateChange.bind(this)
    this.handleCarpoolToPollsDateChange = this.handleCarpoolToPollsDateChange.bind(this)

    this.handleWillCarpoolFromPollsChange = this.handleWillCarpoolFromPollsChange.bind(this)
    this.handleWillCarpoolToPollsChange = this.handleWillCarpoolToPollsChange.bind(this)

    this.handleSubmit = this.handleSubmit.bind(this)
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

  handleSubmit() {
    var apis = []

    if (this.state.willCarpoolToPolls) {
      const params = {
        carpoolQty: this.state.carpoolQty,
        preferredGender: this.state.preferredGender,
        fromLocationId: this.state.startLocation.id,
        toLocationId: this.state.endLocation.id,
        datetime: this.state.carpoolToPollsDateTime
      }
      apis.push(api.submitCarpoolOffer(params))
    }

    if (this.state.willCarpoolFromPolls) {
      const params = {
        carpoolQty: this.state.carpoolQty,
        preferredGender: this.state.preferredGender,
        fromLocationId: this.state.startLocation.id,
        toLocationId: this.state.endLocation.id,
        datetime: this.state.carpoolFromPollsDateTime
      }
      apis.push(api.submitCarpoolOffer(params))
    }

    axios.all(apis)
    .then(axios.spread((...results) => {
      console.log(results)
    }))
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
                      <Panel.Heading>I&apos;m currently in:</Panel.Heading>
                      <Panel.Body>
                        <LocationSelection onChange={this.startLocationChanged}/>
                      </Panel.Body>
                    </Panel>
                  </Col>
                  <Col md={4}>
                    <Panel>
                      <Panel.Heading>I&apos;m voting in:</Panel.Heading>
                      <Panel.Body>
                        <LocationSelection onChange={this.endLocationChanged}/>
                      </Panel.Body>
                    </Panel>
                  </Col>
                  <Col md={4}>
                    <Panel>
                      <Panel.Heading>I can carpool with</Panel.Heading>
                      <Panel.Body>
                        <div>
                          <FormControl
                            onChange={this.handleCarpoolQtyChange}
                            type='number'
                            value={this.state.carpoolQty} /> people.
                        </div>
                        <div>
                          <input
                            type='radio'
                            name='gender'
                            value=''
                            onChange={(e) => this.handleGenderChange(null)}
                            checked={this.state.preferredGender == null}
                            /> Any gender<br />
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
                {this.state.startLocation && this.state.endLocation &&
                <Row>
                  <Col md={6}>
                    <Panel>
                      <Panel.Heading>
                        <input
                          type="checkbox"
                          onChange={this.handleWillCarpoolToPollsChange}
                          checked={this.state.willCarpoolToPolls}
                        />&nbsp; I'm offering a carpool TO the polls
                      </Panel.Heading>
                      <Panel.Body>
                        <div>
                          I'll leave <strong>{this.state.startLocation.name}</strong> for <strong>{this.state.endLocation.name}</strong> at:
                          <DateSelection date={this.carpoolToPollsDateTime} onChange={this.handleCarpoolToPollsDateChange} />
                        </div>
                      </Panel.Body>
                    </Panel>
                  </Col>
                  <Col md={6}>
                    <Panel>
                      <Panel.Heading>
                      <input
                          type="checkbox"
                          onChange={this.handleWillCarpoolFromPollsChange}
                          checked={this.state.willCarpoolFromPolls}
                        />&nbsp; I'm offering a carpool back AFTER the polls
                      </Panel.Heading>
                      <Panel.Body>
                        <div>
                          I'll leave <strong>{this.state.endLocation.name}</strong> for <strong>{this.state.startLocation.name}</strong> at:
                          <DateSelection date={this.carpoolFromPollsDateTime} onChange={this.handleCarpoolFromPollsDateChange} />
                        </div>
                      </Panel.Body>
                    </Panel>
                  </Col>
                </Row>
                }
                {this.getValidationState() &&
                  <Row>
                    <Col mdOffset={10} md={2}>
                      <Button bsStyle='success' onClick={this.handleSubmit}>Submit carpool offer</Button>
                    </Col>
                  </Row>
                }
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </div>
    )
  }
}
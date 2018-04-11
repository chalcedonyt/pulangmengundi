import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Checkbox, Col, DropdownButton, FormControl, MenuItem, Radio, Row, Panel} from 'react-bootstrap'
import DateSelection from './DateSelection'
import LocationSelection from './LocationSelection'
import NeedCarpoolConfirmModal from './NeedCarpoolConfirmModal'

export default class NeedCarpool extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fromLocation: null,
      pollLocation: null,
      gender: null,
      showConfirmModal: false,
      information: '',
      existingId: null
    }
    this.fromLocationChanged = this.fromLocationChanged.bind(this)
    this.pollLocationChanged = this.pollLocationChanged.bind(this)
    this.handleGenderChange = this.handleGenderChange.bind(this)
    this.handleInformationChange = this.handleInformationChange.bind(this)
    this.toggleModalShow = this.toggleModalShow.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentWillMount() {
    api.getNeed()
    .then((need) => {
      if (need) {
        this.setState({
          pollLocation: need.pollLocation,
          fromLocation: need.fromLocation,
          gender: need.gender,
          information: need.information || '',
          existingId: need.id
        })
      }
    })
  }

  fromLocationChanged(fromLocation) {
    this.setState({
      fromLocation
    })
  }

  pollLocationChanged(pollLocation) {
    this.setState({
      pollLocation
    })
  }

  handleGenderChange(gender) {
    this.setState({
      gender
    })
  }

  handleInformationChange(e) {
    this.setState({
      information: e.target.value
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

  handleSubmit() {
    const params = {
      fromLocationId: this.state.fromLocation.id,
      pollLocationId: this.state.pollLocation.id,
      gender: this.state.gender,
      information: this.state.information,
    }
    if (!this.state.existingId) {
      api.submitCarpoolNeed(params)
      .then(() => {
        location.href='/carpool/my-need'
      })
    } else {
      api.updateCarpoolNeed(this.state.existingId, params)
      .then(() => {
        location.href='/carpool/my-need'
      })
    }
  }

  toggleModalShow(bool) {
    this.setState({
      showConfirmModal: bool
    })
  }

  render() {
    return (
      <div>
        <div className="container">
          <h1>Look for a carpool</h1>
          <Row>
            <Col md={12} xs={12}>
              <Panel>
                <Panel.Body>
                  <Row>
                    <Col md={4}>
                      <Panel>
                        <Panel.Heading>
                          I&apos;m currently in:
                        </Panel.Heading>
                        <Panel.Body>
                          <LocationSelection onChange={this.fromLocationChanged} initialLocation={this.state.fromLocation} />
                        </Panel.Body>
                      </Panel>
                    </Col>
                    <Col md={4}>
                      <Panel>
                        <Panel.Heading>
                          I&apos;m voting in:
                        </Panel.Heading>
                        <Panel.Body>
                          <LocationSelection onChange={this.pollLocationChanged} initialLocation={this.state.pollLocation}/>
                        </Panel.Body>
                      </Panel>
                    </Col>
                    <Col md={4}>
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
                              checked={this.state.gender == 'male'}
                              />Male<br />
                            <input
                              type='radio'
                              name='gender'
                              value='female'
                              onChange={(e) => this.handleGenderChange('female')}
                              checked={this.state.gender == 'female'}
                              />Female<br />
                          </div>
                        </Panel.Body>
                      </Panel>
                    </Col>
                    <Col md={4}>
                      <Panel>
                        <Panel.Heading>
                        More information
                        </Panel.Heading>
                        <Panel.Body>
                        <FormControl
                          componentClass='textarea'
                          placeholder='Leave more details here'
                          value={this.state.information}
                          onChange={this.handleInformationChange} />
                        </Panel.Body>
                      </Panel>
                    </Col>
                  </Row>
                </Panel.Body>
                {this.state.pollLocation && this.state.fromLocation && this.state.gender &&
                  <Panel.Footer>
                    <Row>
                      <Col mdOffset={10} md={2} xsOffset={4} xs={4}>
                        <Button bsStyle='success' onClick={(e) => this.toggleModalShow(true)}>
                        {this.state.existingId
                        ? 'Update carpool request'
                        : 'Save carpool request'
                        }

                        </Button>
                      </Col>
                    </Row>
                  </Panel.Footer>
                }
              </Panel>
            </Col>
          </Row>
        </div>
        <NeedCarpoolConfirmModal
          show={this.state.showConfirmModal}
          fromLocation={this.state.fromLocation}
          pollLocation={this.state.pollLocation}
          gender={this.state.gender}
          onOK={this.handleSubmit}
          onCancel={(e) => this.toggleModalShow(false)}
        />
      </div>
    )
  }
}
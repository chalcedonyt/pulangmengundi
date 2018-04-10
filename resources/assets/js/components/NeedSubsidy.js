import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Col, DropdownButton, Row, Panel} from 'react-bootstrap'
import LocationSelection from './LocationSelection'

export default class NeedSubsidy extends Component {
  constructor(props) {
    super(props)
    this.state = {
      subsidyNeeded: 0,
      selectedLocation: null
    }
    this.handleLocationChange = this.handleLocationChange.bind(this)
    this.handleSubsidyNeededChange = this.handleSubsidyNeededChange.bind(this)
  }

  getValidationState() {
    return !isNaN(this.state.subsidyNeeded) && this.state.subsidyNeeded > 0
    && this.state.selectedLocation
  }

  handleLocationChange(selectedLocation) {
    console.log("Location is %O", selectedLocation)
    this.setState({
      selectedLocation
    })
  }

  handleSubsidyNeededChange(e) {
    this.setState({
      subsidyNeeded: e.target.value
    })
  }

  render() {
    return (
      <div>
        <Panel>
          <Panel.Body>
            <Row>
              <Col md={6}>
                <Panel>
                  <Panel.Heading>
                    How much are your ticket(s)?
                  </Panel.Heading>
                  <Panel.Body>
                    <p>Note: A person helping will want to see proof of purchase.</p>
                    RM <input type="number" value={this.state.subsidyNeeded} onChange={this.handleSubsidyNeededChange} />
                  </Panel.Body>
                </Panel>
              </Col>
              <Col md={6}>
              <Panel>
                  <Panel.Heading>
                    Where are you voting?
                  </Panel.Heading>
                  <Panel.Body>
                    <p>A person helping may ask for proof that you are voting in this location.</p>
                    <LocationSelection onChange={this.handleLocationChange} />
                  </Panel.Body>
                </Panel>
              </Col>
            </Row>
            {this.getValidationState() &&
                  <Row>
                    <Col mdOffset={10} md={2}>
                      <Button bsStyle='success'>Submit subsidy request</Button>
                    </Col>
                  </Row>
                }
          </Panel.Body>
        </Panel>
      </div>
    )
  }
}
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Alert, Button, Checkbox, Col, DropdownButton, FormControl, FormGroup, MenuItem, Radio, Row, Panel} from 'react-bootstrap'
import DateSelection from './shared/DateSelection'
import LocationSelection from './shared/LocationSelection'
import OfferCarpoolModal from './OfferCarpoolModal'
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'

import moment from 'moment'
import axios from 'axios'

export default class OfferCarpool extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startLocation: null,
      pollLocation: null,
      preferredGender: null,
      information: '',
      willCarpoolFromPolls: true,
      willCarpoolToPolls: true,
      carpoolFromPollsDateTime: null,
      carpoolToPollsDateTime: null,
      contactNumber: '',
      allowEmail: true,
      allowFb: true,
      showModal: false
    }
    this.startLocationChanged = this.startLocationChanged.bind(this)
    this.pollLocationChanged = this.pollLocationChanged.bind(this)
    this.handleGenderChange = this.handleGenderChange.bind(this)
    this.handleInformationChange = this.handleInformationChange.bind(this)
    this.handleCarpoolFromPollsDateChange = this.handleCarpoolFromPollsDateChange.bind(this)
    this.handleCarpoolToPollsDateChange = this.handleCarpoolToPollsDateChange.bind(this)
    this.handleContactNumberChange = this.handleContactNumberChange.bind(this)

    this.handleWillCarpoolFromPollsChange = this.handleWillCarpoolFromPollsChange.bind(this)
    this.handleWillCarpoolToPollsChange = this.handleWillCarpoolToPollsChange.bind(this)
    this.toggleAllowFb = this.toggleAllowFb.bind(this)
    this.toggleAllowEmail = this.toggleAllowEmail.bind(this)

    this.setShowModal = this.setShowModal.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  startLocationChanged(startLocation) {
    this.setState({
      startLocation
    })
  }

  pollLocationChanged(pollLocation) {
    this.setState({
      pollLocation
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

  handleInformationChange(e) {
    this.setState({
      information: e.target.value
    })
  }

  handleContactNumberChange(e) {
    this.setState({
      contactNumber: e.target.value
    })
  }

  toggleAllowFb() {
    this.setState({
      allowFb: !this.state.allowFb
    })
  }

  toggleAllowEmail() {
    this.setState({
      allowEmail: !this.state.allowEmail
    })
  }

  setShowModal(showModal) {
    var offers = []
    if (this.state.willCarpoolToPolls && this.state.carpoolToPollsDateTime) {
      offers.push({
        contactNumber: this.state.contactNumber,
        startLocation: this.state.startLocation,
        endLocation: this.state.pollLocation,
        datetime: this.state.carpoolToPollsDateTime,
        allowEmail: this.state.allowEmail,
        allowFb: this.state.allowFb,
      })
    }

    if (this.state.willCarpoolFromPolls && this.state.carpoolFromPollsDateTime) {
      offers.push({
        contactNumber: this.state.contactNumber,
        startLocation: this.state.pollLocation,
        endLocation: this.state.startLocation,
        datetime: this.state.carpoolFromPollsDateTime,
        allowEmail: this.state.allowEmail,
        allowFb: this.state.allowFb,
      })
    }
    this.setState({
      showModal,
      offers
    })
  }

  getValidationState() {
    // console.log("State is %O", this.state)
    const valid = this.state.pollLocation && this.state.startLocation &&
    ( this.state.willCarpoolFromPolls ? this.state.carpoolFromPollsDateTime !== null : true )
    && ( this.state.willCarpoolToPolls ? this.state.carpoolToPollsDateTime !== null : true )
    && ( this.state.willCarpoolFromPolls || this.state.willCarpoolToPolls )
    && (this.state.allowEmail || this.state.allowFb)
    return valid ? 'success' : 'warning'
  }

  handleSubmit() {
    if (this.getValidationState() !== 'success')
      return

    var apis = []
    if (this.state.willCarpoolToPolls) {
      const params = {
        contactNumber: this.state.contactNumber,
        preferredGender: this.state.preferredGender,
        fromLocationId: this.state.startLocation.id,
        toLocationId: this.state.pollLocation.id,
        datetime: this.state.carpoolToPollsDateTime,
        allowEmail: this.state.allowEmail,
        allowFb: this.state.allowFb,
      }
      apis.push(api.submitCarpoolOffer(params))
    }

    if (this.state.willCarpoolFromPolls) {
      const params = {
        contactNumber: this.state.contactNumber,
        preferredGender: this.state.preferredGender,
        toLocationId: this.state.startLocation.id,
        fromLocationId: this.state.pollLocation.id,
        datetime: this.state.carpoolFromPollsDateTime,
        information: this.state.information,
        allowEmail: this.state.allowEmail ? 1 : 0,
        allowFb: this.state.allowFb ? 1 : 0,
      }
      apis.push(api.submitCarpoolOffer(params))
    }

    axios.all(apis)
    .then(axios.spread((...results) => {
      // console.log(results)
      window.location='/my-offers'
    }))
  }

  render() {
    return (
      <div>
        <Panel bsStyle='primary'>
          <Panel.Heading>
            <h3>
              <FormattedMessage
                id="offer.header-create"
                defaultMessage={`Offer to create a carpool`}
              />
            </h3>
          </Panel.Heading>
          <Panel.Body>
            <Alert bsStyle="info">
              <FormattedHTMLMessage
                id="offer.create-info"
                defaultMessage={`Pick where you are leaving from and where you are going to, then check and fill in the timings for at least <strong>one</strong> direction you want to carpool for.`}
              />
            </Alert>
            <Row>
              <Col md={4}>
                <Panel>
                  <Panel.Heading>
                    <FormattedMessage
                      id="request.header-i-from"
                      defaultMessage={`I am currently in`}
                    />:
                  </Panel.Heading>
                  <Panel.Body>
                    <LocationSelection onChange={this.startLocationChanged}/>
                  </Panel.Body>
                </Panel>
              </Col>
              <Col md={4}>
                <Panel>
                  <Panel.Heading>
                    <FormattedMessage
                      id="request.header-i-going"
                      defaultMessage={`I am voting in`}
                    />:
                  </Panel.Heading>
                  <Panel.Body>
                    <LocationSelection onChange={this.pollLocationChanged}/>
                  </Panel.Body>
                </Panel>
              </Col>
              <Col md={4}>
                <Panel>
                  <Panel.Heading>
                    <FormattedMessage
                      id="offer.header-gender-prev"
                      defaultMessage={`I prefer to carpool with`}
                    />:
                  </Panel.Heading>
                  <Panel.Body>
                    <Row>
                      <Col md={8} xs={4}>
                        <div>
                        <input
                          type='radio'
                          name='gender'
                          value=''
                          onChange={(e) => this.handleGenderChange(null)}
                          checked={this.state.preferredGender == null}
                          />
                          <FormattedMessage
                            id="offer.gender-pref-any"
                            defaultMessage={`Any gender`}
                          />
                          <br />
                        <input
                          type='radio'
                          name='gender'
                          value='male'
                          onChange={(e) => this.handleGenderChange('male')}
                          checked={this.state.preferredGender == 'male'}
                          />
                          <FormattedMessage
                            id="offer.gender-pref-male"
                            defaultMessage={`Male`}
                          />
                          <br />
                        <input
                          type='radio'
                          name='gender'
                          value='female'
                          onChange={(e) => this.handleGenderChange('female')}
                          checked={this.state.preferredGender == 'female'}
                          />
                          <FormattedMessage
                            id="offer.gender-pref-female"
                            defaultMessage={`Female`}
                          />
                          <br />
                      </div>
                      </Col>
                    </Row>
                  </Panel.Body>
                </Panel>
              </Col>
            </Row>
            {this.state.startLocation && this.state.pollLocation &&
            <div>

              <Row>
                <Col md={6}>
                  <Panel>
                    <Panel.Heading>
                      <input
                        type="checkbox"
                        onChange={this.handleWillCarpoolToPollsChange}
                        checked={this.state.willCarpoolToPolls}
                      />&nbsp;
                      <FormattedMessage
                        id="offer.checkbox-carpool-to"
                        defaultMessage={`I am offering a carpool TO the polls`}
                      />
                    </Panel.Heading>
                    <Panel.Body>
                      <div>
                        <FormattedMessage
                          id="offer.info-from-time"
                          defaultMessage={`I'll leave {from} for {to} at:`}
                          values={{
                            from: <strong>{this.state.startLocation.name}</strong>,
                            to: <strong>{this.state.pollLocation.name}</strong>
                          }}
                        />
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
                      />&nbsp;
                      <FormattedMessage
                        id="offer.checkbox-carpool-back"
                        defaultMessage={`I am offering a carpool BACK after the polls`}
                      />
                    </Panel.Heading>
                    <Panel.Body>
                      <div>
                        <FormattedMessage
                          id="offer.info-come-back-time"
                          defaultMessage={`I'll leave {from} for {to} at:`}
                          values={{
                            from: <strong>{this.state.pollLocation.name}</strong>,
                            to: <strong>{this.state.startLocation.name}</strong>
                          }}
                        />
                        <DateSelection date={this.carpoolFromPollsDateTime} onChange={this.handleCarpoolFromPollsDateChange} />
                      </div>
                    </Panel.Body>
                  </Panel>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Panel>
                    <Panel.Heading>
                      <FormattedMessage
                        id="request.create-header-more-info"
                        defaultMessage={`More information`}
                      />
                    </Panel.Heading>
                    <Panel.Body>
                      <FormControl
                        componentClass='textarea'
                        rows={8}
                        placeholder='Leave more details here'
                        value={this.state.information}
                        onChange={this.handleInformationChange} />
                    </Panel.Body>
                  </Panel>
                </Col>
                <Col md={4}>
                  <Panel>
                    <Panel.Heading>
                      <FormattedMessage
                        id="request.create-header-what-to-show"
                        defaultMessage={`What info to show potential matches`}
                      />
                    </Panel.Heading>
                    <Panel.Body>
                      <Alert bsStyle='info'>
                        <p>
                          <FormattedMessage
                            id="request.info-choose-what-to-show"
                            defaultMessage={`Choose at least one option below, and optionally your contact number. Your information will be shown to others after they pass a captcha check.`}
                          />
                        </p>
                        <p>
                          <FormattedMessage
                            id="request.info-choose-what-to-show-fb"
                            defaultMessage={`If you choose to show your Facebook account, do be responsive to new FB message requests!`}
                          />
                        </p>
                      </Alert>
                      <input type="checkbox" onChange={this.toggleAllowEmail} checked={this.state.allowEmail} />
                      <FormattedMessage
                        id="request.checkbox-show-email"
                        defaultMessage={`Show my email address.`}
                      /><br />
                      <input type="checkbox" onChange={this.toggleAllowFb} checked={this.state.allowFb} />
                      <FormattedMessage
                        id="request.checkbox-show-fb"
                        defaultMessage={`Show the link to my Facebook account.`}
                      />
                      <br />
                      <FormattedMessage
                        id="request.checkbox-show-contact"
                        defaultMessage={`Show my contact number:`}
                      />
                      <input type='text' size='20' maxLength='20' value={this.state.contactNumber} onChange={this.handleContactNumberChange} />
                    </Panel.Body>
                  </Panel>
                </Col>
                <Col md={4}>
                {this.getValidationState() !== 'success' &&
                  <Alert bsStyle='danger'>
                    <ul>
                      {!this.state.startLocation &&
                      <li>
                        <FormattedMessage
                          id="request.warning-select-from"
                          defaultMessage={`Please select your start location`}
                        />
                      </li>}
                      {!this.state.pollLocation &&
                      <li>
                        <FormattedMessage
                          id="request.warning-select-to"
                          defaultMessage={`Please select your voting destination`}
                        />
                      </li>}
                      {!(this.state.allowEmail || this.state.allowFb) &&
                      <li>
                        <FormattedMessage
                          id="request.warning-select-contact-detail"
                          defaultMessage={`You must show either your email address or Facebook account`}
                        />
                      </li>}
                      {!(
                      ( this.state.willCarpoolFromPolls ? this.state.carpoolFromPollsDateTime !== null : true )
                      && ( this.state.willCarpoolToPolls ? this.state.carpoolToPollsDateTime !== null : true )
                      && ( this.state.willCarpoolFromPolls || this.state.willCarpoolToPolls )
                      )
                      &&
                      <li>
                        <FormattedMessage
                          id="request.warning-fill-trip-detail"
                          defaultMessage={`You must fill in details for at least one trip`}
                        />
                      </li>
                    }
                    </ul>
                  </Alert>
                }
                </Col>
              </Row>
            </div>
            }
          </Panel.Body>
          {this.getValidationState() == 'success' &&
          <Panel.Footer>
            <Row>
              <Col md={3} mdOffset={5} xs={6} xsOffset={3}>
                <FormGroup controlId='OfferForm' validationState={this.getValidationState()}>
                  <Button
                    bsStyle={'success'}
                    onClick={(e)=>this.setShowModal(true)}
                    type='submit'>
                    <FormattedMessage
                      id="offer.btn-submit"
                      defaultMessage={`Submit carpool offer`}
                    />
                  </Button>
                </FormGroup>
              </Col>
            </Row>
          </Panel.Footer>
            }
        </Panel>
        <OfferCarpoolModal
          offers={this.state.offers}
          show={this.state.showModal}
          onOK={this.handleSubmit}
          onCancel={(e)=>this.setShowModal(false)} />
      </div>
    )
  }
}
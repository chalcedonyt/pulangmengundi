import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Alert, Button, Checkbox, Col, DropdownButton, FormControl, MenuItem, Radio, Row, Panel} from 'react-bootstrap'
import DateSelection from './DateSelection'
import LocationSelection from './LocationSelection'
import NeedCarpoolConfirmModal from './NeedCarpoolConfirmModal'
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'

export default class NeedCarpool extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fromLocation: null,
      pollLocation: null,
      gender: null,
      showConfirmModal: false,
      information: '',
      existingId: null,

      allowEmail: true,
      allowFb: true,
      contactNumber: ''
    }
    this.fromLocationChanged = this.fromLocationChanged.bind(this)
    this.pollLocationChanged = this.pollLocationChanged.bind(this)
    this.handleGenderChange = this.handleGenderChange.bind(this)
    this.handleInformationChange = this.handleInformationChange.bind(this)
    this.toggleModalShow = this.toggleModalShow.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleContactNumberChange = this.handleContactNumberChange.bind(this)

    this.toggleAllowEmail = this.toggleAllowEmail.bind(this)
    this.toggleAllowFb = this.toggleAllowFb.bind(this)
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
          existingId: need.id,
          contactNumber: need.user.contact_number,
          allowEmail: need.user.allow_email,
          allowFb: need.user.allow_fb,
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

  handleContactNumberChange(e) {
    this.setState({
      contactNumber: e.target.value
    })
  }

  handleSubmit() {
    const params = {
      fromLocationId: this.state.fromLocation.id,
      pollLocationId: this.state.pollLocation.id,
      gender: this.state.gender,
      information: this.state.information,
      allowEmail: this.state.allowEmail,
      allowFb: this.state.allowFb,
      contactNumber: this.state.contactNumber
    }
    if (!this.state.existingId) {
      api.submitCarpoolNeed(params)
      .then(() => {
        location.href='/my-need'
      })
    } else {
      api.updateCarpoolNeed(this.state.existingId, params)
      .then(() => {
        location.href='/my-need'
      })
    }
  }

  toggleAllowEmail(){
    this.setState({
      allowEmail: !this.state.allowEmail
    })
  }

  toggleAllowFb(){
    this.setState({
      allowFb: !this.state.allowFb
    })
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
          {this.state.existingId
          ? <h1>
              <FormattedMessage
                id="request.header-update"
                defaultMessage={`Update your carpool request`}
              />
            </h1>
          : <h1>
              <FormattedMessage
                id="request.header-create"
                defaultMessage={`Look for a carpool`}
              />
            </h1>
          }
          <Alert bsStyle='info'>
            <p>
              <FormattedMessage
                id="request.create-info-1"
                defaultMessage={`Fill in where you are from, where you are going to vote in, and gender, then submit your offer to the database.`}
              />
            </p>
            <p>
              <FormattedMessage
                id="request.create-info-2"
                defaultMessage={`You will then be able to search for drivers going the same way as you.`}
              />
            </p>
          </Alert>
          <Row>
            <Col md={12} xs={12}>
              <Panel>
                <Panel.Body>
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
                          <LocationSelection onChange={this.fromLocationChanged} initialLocation={this.state.fromLocation} />
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
                          <LocationSelection onChange={this.pollLocationChanged} initialLocation={this.state.pollLocation}/>
                        </Panel.Body>
                      </Panel>
                    </Col>
                    <Col md={4}>
                      <Panel>
                        <Panel.Heading>
                          <FormattedMessage
                            id="request.header-my-gender"
                            defaultMessage={`My gender is`}
                          />
                        </Panel.Heading>
                        <Panel.Body>
                          <div>
                            <input
                              type='radio'
                              name='gender'
                              value='male'
                              onChange={(e) => this.handleGenderChange('male')}
                              checked={this.state.gender == 'male'}
                              />
                              <FormattedMessage
                                id="request.gender-value-male"
                                defaultMessage={`Male`}
                              />
                              <br />
                            <input
                              type='radio'
                              name='gender'
                              value='female'
                              onChange={(e) => this.handleGenderChange('female')}
                              checked={this.state.gender == 'female'}
                              />
                            <FormattedMessage
                              id="request.gender-value-female"
                              defaultMessage={`Female`}
                            />
                            <br />
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
                          rows={8}
                          componentClass='textarea'
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
                  </Row>
                </Panel.Body>
                {this.state.pollLocation && this.state.fromLocation && this.state.gender && (this.state.allowEmail || this.state.allowFb) &&
                  <Panel.Footer>
                    <Row>
                      <Col mdOffset={9} md={3} xsOffset={1} xs={4}>
                        <Button bsStyle='success' onClick={(e) => this.toggleModalShow(true)}>
                        {this.state.existingId
                        ? <FormattedMessage
                            id="request.btn-update"
                            defaultMessage={`Update carpool request`}
                          />
                        : <FormattedMessage
                            id="request.btn-save"
                            defaultMessage={`Save carpool request`}
                          />
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
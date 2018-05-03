import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Alert, Button, Grid, FormControl, Col, Row, Panel} from 'react-bootstrap'
import {FormattedMessage as FM, FormattedHTMLMessage as FHM} from 'react-intl'
import api from '../utils/api'
import Terms from './shared/Terms'

export default class UpdateEmailAddress extends Component {
  constructor(props) {
    super(props)
    this.state = {
      emailAddressConfirm: '',
      emailAddress: ''
    }
    this.validated = this.validated.bind(this)
    this.handleEmailChange = this.handleEmailChange.bind(this)
    this.handleEmailConfirmChange = this.handleEmailConfirmChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleEmailChange (e) {
    this.setState({
      emailAddress: e.target.value
    })
  }

  handleEmailConfirmChange (e) {
    this.setState({
      emailAddressConfirm: e.target.value
    })
  }

  validated(email) {
    var re = /\S+@\S+\.\S+/
    return re.test(this.state.emailAddress) && this.state.emailAddress == this.state.emailAddressConfirm
  }

  handleSubmit() {
    api.updateEmail(this.state.emailAddress)
    .then(() => {
      location.href = '/'
    })
  }

  render() {
    return (
      <Row>
        <Col md={6} mdOffset={3}>
          <Panel>
            <Panel.Heading>
              <h4>Please set your email address</h4>
            </Panel.Heading>
            <Panel.Body>
              <h4>You have been redirected to this page because you are unable to retrieve your email address from Facebook. Please set it here.</h4>
              <strong>Email Address</strong>
              <p>
                <FormControl type='text'
                  onChange={this.handleEmailChange}
                  value={this.state.emailAddress}
                  size={40}
                />
              </p>
              <strong>Confirm Email Address</strong>
              <p>
                <FormControl type='text'
                  onChange={this.handleEmailConfirmChange}
                  value={this.state.emailAddressConfirm}
                  size={40}
                />
              </p>
            </Panel.Body>
            <Panel.Footer>
              {this.validated()
                && <Button onClick={this.handleSubmit} bsStyle='success'>Submit</Button>
              }
            </Panel.Footer>
          </Panel>
        </Col>
      </Row>
    )
  }
}
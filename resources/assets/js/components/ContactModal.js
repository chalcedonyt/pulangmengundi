import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'

import {Alert, Modal, Row, Panel, Col, Button} from 'react-bootstrap'
import ReCAPTCHA from "react-google-recaptcha"

export default class ContactModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: null,
      facebook: null
    }
    this.handleCaptchaSuccess = this.handleCaptchaSuccess.bind(this)
  }

  handleCaptchaSuccess() {
    api.getUser(this.props.user.uuid)
    .then(({facebook, email}) => {
      this.setState({
        email,
        facebook
      })
    })
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Contact {this.props.user.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>What to do now</h4>
        <Alert bsStyle='info'>
          <form>
            <p>
              Click here to show {this.props.user.name}&apos;s Facebook profile:
            </p>
            <ReCAPTCHA
              ref="recaptcha"
              sitekey="6LcJuFIUAAAAAPro54ESMzsWQDPTp8iljIBhzJqr"
              onChange={this.handleCaptchaSuccess}
            />
            {this.state.email &&
            <Panel>
              <Panel.Heading>{this.props.user.name}&apos;s email address:</Panel.Heading>
              <Panel.Body>
                <Button target="_blank">{this.state.email}</Button>
              </Panel.Body>
            </Panel>
            }
            {this.state.facebook &&
            <Panel>
              <Panel.Heading>{this.props.user.name}&apos;s Facebook profile link:</Panel.Heading>
              <Panel.Body>
                <Button href={this.state.facebook} target="_blank">Profile (Opens in new window)</Button>
                <h3>How do I contact someone on Facebook?</h3>
                <p>

                </p>
              </Panel.Body>
            </Panel>
            }

          </form>
        </Alert>
        <Panel>
          <Panel.Body>
            <p>
              Get in touch and arrange your trip! Some safety precautions below:
            </p>
            <ul>
              <li>Exchange contact details (e.g. phone numbers)</li>
              <li>Ensure the other users are real people (e.g. in a video call)</li>
              <li>Share the details of your trip and the details of the other ride-sharers with your friends and family</li>
            </ul>
          </Panel.Body>
        </Panel>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.props.onCancel}>Close</Button>
      </Modal.Footer>
    </Modal>
    )
  }
}
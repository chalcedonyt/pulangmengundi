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
      facebook: null,
      contact_number: null,
      hasRequested: false
    }
    this.handleCaptchaSuccess = this.handleCaptchaSuccess.bind(this)
  }

  handleCaptchaSuccess() {
    api.getUser(this.props.user.uuid)
    .then(({facebook, email, contact_number}) => {
      this.setState({
        email,
        facebook,
        contact_number,
        hasRequested: true
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
        {!this.state.hasRequested &&
        <Alert bsStyle='info'>
          <form>
            <div>
              <p>
                Click here to show <strong>{this.props.user.name}&apos;s</strong> contact information:
              </p>
              <Alert bsStyle='danger'>
              To prevent abuse, you will be blocked if you request too many profiles.
              </Alert>
            </div>
            <ReCAPTCHA
              ref="recaptcha"
              sitekey="6LcJuFIUAAAAAPro54ESMzsWQDPTp8iljIBhzJqr"
              onChange={this.handleCaptchaSuccess}
            />
          </form>
        </Alert>
        }
        {this.state.hasRequested &&
        <Panel bsStyle='success'>
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
        }
        {this.state.email &&
        <Panel>
          <Panel.Heading>
            <h4>{this.props.user.name}&apos;s email address:</h4>
          </Panel.Heading>
          <Panel.Body>
            <Row>
              <Col md={6} mdOffset={3}>
                <Button target="_blank">{this.state.email}</Button>
              </Col>
            </Row>
          </Panel.Body>
        </Panel>
        }
        {this.state.contact_number &&
        <Panel>
          <Panel.Heading>
            <h4>{this.props.user.name}&apos;s contact number:</h4>
          </Panel.Heading>
          <Panel.Body>
            <Row>
              <Col md={6} mdOffset={3}>
                <Button target="_blank">{this.state.contact_number}</Button>
              </Col>
            </Row>
          </Panel.Body>
        </Panel>
        }
        {this.state.facebook &&
        <Panel>
          <Panel.Heading>
            <h4>
              {this.props.user.name}&apos;s Facebook profile link:
            </h4>
          </Panel.Heading>
          <Panel.Body>
            <Row>
              <Col md={6} mdOffset={3}>
                <Button href={this.state.facebook} target="_blank">Profile (Opens new window)</Button>
              </Col>
            </Row>
            <br />
            <Panel>
              <Panel.Body>
                <h4>How do I contact someone on Facebook?</h4>
                <p>
                  Because Facebook blocks new Messages by default, try the following methods:
                </p>
                <h4>1. Send a Friend request.</h4>
                <img className='modal-img' src='/img/FB1.jpg' />
                <br/>
                <br/>
                <h4>2. Send them a Facebook Message introducing yourself.</h4>
                <img className='modal-img' src='/img/FB2.jpg' />
                <img className='modal-img' src='/img/FB3.jpg' />
                <br/>
                <br/>
                <h4>
                  They should see a notification in Facebook messenger with your introduction.
                </h4>
                <img className='modal-img' src='/img/FB4.jpg' />
              </Panel.Body>
            </Panel>
          </Panel.Body>
        </Panel>
        }
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.props.onCancel}>Close</Button>
      </Modal.Footer>
    </Modal>
    )
  }
}
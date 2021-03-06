import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'

import {Alert, Modal, Row, Panel, Col, Button} from 'react-bootstrap'
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'
import ReCAPTCHA from "react-google-recaptcha"
import Disclaimer from './shared/Disclaimer'

export default class ContactModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: null,
      facebook: null,
      contact_number: null,
      hasRequested: false,
      shouldShowEmail: false,
      shouldShowContactNumber: false,
    }
    this.handleCaptchaSuccess = this.handleCaptchaSuccess.bind(this)
    this.handleShowEmail = this.handleShowEmail.bind(this)
    this.handleShowContactNumber = this.handleShowContactNumber.bind(this)
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

  handleShowEmail() {
    this.trackContactActivity('ShowedEmail');
    this.setState({
      shouldShowEmail: true
    })
  }

  handleShowContactNumber() {
    this.trackContactActivity('ShowedContactNumber');
    this.setState({
      shouldShowContactNumber: true
    })
  }

  trackContactActivity(type) {
    gtag('event', 'ContactActivity', {
      event_category: type,
      event_label: type
    })
  }

  render() {
    const facebookLink = `https://facebook.com/search/people/?q=` + window.encodeURIComponent(this.props.user.name)
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="contact-header"
              defaultMessage={`Contact`}
            /> {this.props.user.name}</Modal.Title>
        </Modal.Header>
      <Modal.Body>
        <h4>
          <FormattedMessage
            id="contact.after-open-dialog-header"
            defaultMessage={`What to do now`}
          />
        </h4>
        {!this.state.hasRequested &&
        <Alert bsStyle='info'>
          <form>
            <div>
              <p>
                <FormattedMessage
                  id="contact.click-to-show-text"
                  defaultMessage={`Click here to show contact information for {name}:`}
                  values={{
                    name: <strong>{this.props.user.name}</strong>
                  }}
                />
              </p>
              <Alert bsStyle='danger'>
                <FormattedMessage
                  id="contact.prevent-abuse"
                  defaultMessage={`To prevent abuse, you will be blocked if you request too many profiles.`}
                />
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
            <Alert>
              <p>
                <FormattedMessage
                  id="contact.after-show-1"
                  defaultMessage={`Get in touch and arrange your trip! Some safety precautions below:`}
                />
              </p>
              <ul>
                <li>
                  <FormattedMessage
                    id="contact.after-show-2"
                    defaultMessage={`Exchange contact details (e.g. phone numbers)`}
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="contact.after-show-3"
                    defaultMessage={`Ensure the other users are real people (e.g. in a video call)`}
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="contact.after-show-4"
                    defaultMessage={`Share the details of your trip and the details of the other ride-sharers with your friends and family`}
                  />
                </li>
              </ul>
            </Alert>
            <Disclaimer />
          </Panel.Body>
        </Panel>
        }
        {this.state.email &&
        <Panel>
          <Panel.Heading>
            <h4>
              <FormattedMessage
                id="contact.header-email-address"
                defaultMessage={`Email address for {name}`}
                values={{
                  name: <span>{this.props.user.name}</span>
                }}
              />:
            </h4>
          </Panel.Heading>
          <Panel.Body>
            <Row>
              <Col md={6} mdOffset={3}>
                {!this.state.shouldShowEmail &&
                  <Button target="_blank" onClick={this.handleShowEmail}>
                    <FormattedMessage
                      id="contact.click-email"
                      defaultMessage={`Click to show email address`}
                    />
                  </Button>
                }
                {this.state.shouldShowEmail &&
                  <Button target="_blank">{this.state.email}</Button>
                }
              </Col>
            </Row>
          </Panel.Body>
        </Panel>
        }
        {this.state.contact_number &&
        <Panel>
          <Panel.Heading>
            <h4>
              <FormattedMessage
                id="contact.header-contact"
                defaultMessage={`Contact number for {name}`}
                values={{
                  name: <span>{this.props.user.name}</span>
                }}
              />:
            </h4>
          </Panel.Heading>
          <Panel.Body>
            <Row>
              <Col md={6} mdOffset={3}>
                {!this.state.shouldShowContactNumber &&
                    <Button target="_blank" onClick={this.handleShowContactNumber}>
                      <FormattedMessage
                        id="contact.click-contact-number"
                        defaultMessage={`Click to show contact number`}
                      />
                    </Button>
                  }
                {this.state.shouldShowContactNumber &&
                  <Button target="_blank">{this.state.contact_number}</Button>
                }
              </Col>
            </Row>
          </Panel.Body>
        </Panel>
        }
        {this.state.facebook &&
        <Panel>
          <Panel.Heading>
            <h4>
              <FormattedMessage
                id="contact.header-fb-profile"
                defaultMessage={`Facebook profile link for {name}`}
                values={{
                  name: <span>{this.props.user.name}</span>
                }}
              />:
            </h4>
          </Panel.Heading>
          <Panel.Body>
            <Row>
              <Col mdOffset={3} md={6} xs={12} sm={12}>
                <img src={this.props.user.avatar_url} width={40} />
                <strong>FB name: {this.props.user.name}</strong>
              </Col>
            </Row>
            <br />
            <Row>
              <Col mdOffset={3} md={6} xs={3} xs={6} smOffset={3} sm={6}>
                <Button href={facebookLink} onClick={(e)=> this.trackContactActivity('ShowedFacebookProfile')} target="_blank">
                  <FormattedMessage
                    id="contact.btn-open-fb-profile"
                    defaultMessage={`Search on FB (Opens new window)`}
                  />
                </Button>
              </Col>
            </Row>
            <br />
            <Panel>
              <Panel.Body>
                <h4>
                  <FormattedMessage
                  id="contact.header-how-to-contact"
                  defaultMessage={`How do I contact someone on Facebook?`}
                  />
                </h4>
                <p>
                  <FormattedMessage
                  id="contact.fb-blocks-msgs"
                  defaultMessage={`Because Facebook blocks new Messages by default, try the following methods:`}
                  />
                </p>
                <h4>
                  <FormattedMessage
                    id="contact.fb-step-1"
                    defaultMessage={`1. Send a Friend request.`}
                  />
                </h4>
                <img className='modal-img' src='/img/FB1.jpg' />
                <br/>
                <br/>
                <h4>
                  <FormattedMessage
                    id="contact.fb-step-2"
                    defaultMessage={`2. Send them a Facebook Message introducing yourself.`}
                  />
                </h4>
                <img className='modal-img' src='/img/FB2.jpg' />
                <img className='modal-img' src='/img/FB3.jpg' />
                <br/>
                <br/>
                <h4>
                  <FormattedMessage
                    id="contact.fb-step-3"
                    defaultMessage={`They should see a notification in Facebook messenger with your introduction.`}
                  />
                </h4>
                <img className='modal-img' src='/img/FB4.jpg' />
              </Panel.Body>
            </Panel>
          </Panel.Body>
        </Panel>
        }
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.props.onCancel}>
          <FormattedMessage
            id="contact.btn-close"
            defaultMessage={`Close`}
          />
        </Button>
      </Modal.Footer>
    </Modal>
    )
  }
}
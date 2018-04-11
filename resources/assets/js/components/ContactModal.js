import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Alert, Modal, Row, Panel, Col, Button} from 'react-bootstrap'

export default class ContactModal extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const fbId = this.props.user.fb_id
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Contact {this.props.user.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>What to do now</h4>
        <Alert bsStyle='info'>
          <div>
            <p>
              This is {this.props.user.name}&apos;s information:
            </p>
            <ul>
              <li><a target='_blank' href={`https://facebook.com/${fbId}`}>Facebook account</a></li>
              <li>

              </li>
            </ul>
          </div>
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
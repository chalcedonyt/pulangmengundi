import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Alert, Modal, Row, Panel, Col, Button} from 'react-bootstrap'

export default class ContactModal extends Component {
  constructor(props) {
    super(props)
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
          <p>
            This is {this.props.user.name}&apos;s information:
            <ul>
              <li><a href={`https://facebook.com/${this.props.user.fb_id}`}>Facebook account</a></li>
              <li>

              </li>
            </ul>
          </p>
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
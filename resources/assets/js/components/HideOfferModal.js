import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Modal, Row, Col, Button} from 'react-bootstrap'

export default class HideOfferModal extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Hide your carpool offer?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Hide carpool offer?</h4>
        <p>Do this when you have accepted all the carpool requests you can fit. You will no longer be publicly listed.

        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.props.onOK} bsStyle='success'>OK</Button>
        <Button onClick={this.props.onCancel}>Cancel</Button>
      </Modal.Footer>
    </Modal>
    )
  }
}
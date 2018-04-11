import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Modal, Row, Col, Button} from 'react-bootstrap'

export default class UnhideOfferModal extends Component {
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
        <h4>Unhide this carpool offer?</h4>
        <p>This will make your carpool offer public again.
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
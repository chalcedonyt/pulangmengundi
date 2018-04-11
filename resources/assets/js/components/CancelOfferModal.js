import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Alert, Modal, Row, Col, Button} from 'react-bootstrap'

export default class CancelOfferModal extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Cancel your carpool offer?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Cancel carpool offer?</h4>
        <Alert bsStyle='danger'>
          <p>You will be removed from listings. This cannot be undone.</p>
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.props.onOK} bsStyle='success'>OK</Button>
        <Button onClick={this.props.onCancel}>Close</Button>
      </Modal.Footer>
    </Modal>
    )
  }
}
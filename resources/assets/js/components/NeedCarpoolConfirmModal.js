import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Modal, Row, Col, Button} from 'react-bootstrap'

export default class NeedCarpoolConfirmModal extends Component {

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm request</Modal.Title>
      </Modal.Header>
      {this.props.show &&
        <Modal.Body>
          <h4>Submit carpool request?</h4>
          <p>You will be shown other voters who are travelling the same way as you.</p>
          <strong>Currently in:</strong>
          <p>
            {this.props.fromLocation.name} ({this.props.fromLocation.state})
          </p>
          <strong>Voting in:</strong>
          <p>
            {this.props.pollLocation.name} ({this.props.pollLocation.state}) <br />
          </p>
          <strong>Gender:</strong>
          <p>
          {this.props.gender}
          </p>
        </Modal.Body>
      }
      <Modal.Footer>
        <Button onClick={this.props.onOK} bsStyle='success'>OK</Button>
        <Button onClick={this.props.onCancel}>Cancel</Button>
      </Modal.Footer>
    </Modal>
    )
  }
}
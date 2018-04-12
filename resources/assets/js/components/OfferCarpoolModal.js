import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Modal, Row, Col, Button} from 'react-bootstrap'

export default class OfferCarpoolModal extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm submission</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Submit carpool offer?</h4>
        <p>Your name, location and times will be shown to users who match your district or state.</p>
        <Row>
          {Array.isArray(this.props.offers) && this.props.offers.map((offer, i) => (
            <Col md={6} xs={6} key={i}>
              <strong>From:</strong>
              <p>
                {offer.startLocation.name} ({offer.startLocation.state})
              </p>
              <strong>To:</strong>
              <p>
              {offer.endLocation.name} ({offer.endLocation.state})
              </p>
              <strong>Time:</strong>
              <p>{offer.datetime.format('MMMM Do YYYY, h:mma')}</p>
            </Col>
          ))}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.props.onOK} bsStyle='success'>OK</Button>
        <Button onClick={this.props.onCancel}>Cancel</Button>
      </Modal.Footer>
    </Modal>
    )
  }
}
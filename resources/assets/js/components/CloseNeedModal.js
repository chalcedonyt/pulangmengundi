import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Modal, Grid, Row, Col, Button} from 'react-bootstrap'

export default class CloseNeedModal extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Please tell us why you are closing your carpool request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Grid fluid>
          <Row>
            <Col md={6} sm={6}>
              <Button bsStyle='success' onClick={this.props.onNeedSuccess}>I have matched <br />with other carpoolers!</Button>
            </Col>
            <Col md={6} sm={6}>
              <Button bsStyle='warning' onClick={this.props.onNeedCancel}>I have changed my mind/<br/>will re-create listing</Button>
            </Col>
          </Row>
        </Grid>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.props.onCancel}>Cancel</Button>
      </Modal.Footer>
    </Modal>
    )
  }
}
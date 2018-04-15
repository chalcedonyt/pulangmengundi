import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Modal, Grid, Row, Col, Button} from 'react-bootstrap'
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'

export default class HideOfferModal extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage
            id="offer.header-close-why"
            defaultMessage={`Please tell us why you are closing your carpool offer`}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Grid fluid>
          <Row>
            <Col md={6}>
              <Button bsStyle='success' onClick={this.props.onOfferSuccess}>
                <FormattedHTMLMessage
                  id="offer.btn-close-success"
                  defaultMessage={`I have matched <br />with other carpoolers!`}
                />
              </Button>
            </Col>
            <Col md={6}>
              <Button bsStyle='warning' onClick={this.props.onOfferCancel}>
                <FormattedHTMLMessage
                  id="offer.btn-cancel-delete"
                  defaultMessage={`I have changed my mind/<br/>will re-create listing`}
                />
              </Button>
            </Col>
          </Row>
        </Grid>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.props.onCancel}>
          <FormattedHTMLMessage
            id="btn-cancel"
            defaultMessage={`Cancel`}
          />
        </Button>
      </Modal.Footer>
    </Modal>
    )
  }
}
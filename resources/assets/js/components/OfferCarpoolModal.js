import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Modal, Row, Col, Button} from 'react-bootstrap'
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'

export default class OfferCarpoolModal extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage
            id="offer.dialog-header-confirm"
            defaultMessage={`Confirm carpool offer`}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>
          <FormattedMessage
            id="offer.dialog-header-submit-question"
            defaultMessage={`Submit carpool offer?`}
          />
        </h4>
        <p>
          <FormattedMessage
            id="offer.info-warning"
            defaultMessage={`Your name, location and times will be shown to users who match your district or state.`}
          />
        </p>
        <Row>
          {Array.isArray(this.props.offers) && this.props.offers.map((offer, i) => (
            <Col md={6} xs={6} key={i}>
              <strong>
                <FormattedMessage
                  id="request.header-i-from"
                  defaultMessage={`I am currently in`}
                />:
              </strong>
              <p>
                {offer.startLocation.name} ({offer.startLocation.state})
              </p>
              <strong>
                <FormattedMessage
                  id="request.header-i-going"
                  defaultMessage={`I am voting in`}
                />:
              </strong>
              <p>
              {offer.endLocation.name} ({offer.endLocation.state})
              </p>
              <strong>
                <FormattedMessage
                  id="offer.dialog-leave-generic"
                  defaultMessage={`I'll leave at`}
                />
                :</strong>
              <p>{offer.datetime.format('MMMM Do YYYY, h:mma')}</p>
            </Col>
          ))}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.props.onOK} bsStyle='success'>
          <FormattedMessage
            id="btn-ok"
            defaultMessage={`OK`}
          />
        </Button>
        <Button onClick={this.props.onCancel}>
          <FormattedMessage
            id="btn-cancel"
            defaultMessage={`Cancel`}
          />
        </Button>
      </Modal.Footer>
    </Modal>
    )
  }
}
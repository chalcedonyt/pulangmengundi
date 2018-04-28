import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Modal, Row, Col, Button} from 'react-bootstrap'
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'

export default class UnhideOfferModal extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage
            id="offer.dialog-unhide-question"
            defaultMessage={`Unhide your carpool offer?`}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>
          <FormattedMessage
            id="offer.dialog-unhide-question"
            defaultMessage={`Unhide your carpool offer?`}
          />
          </h4>
        <p>
          <FormattedMessage
            id="offer.warning-undo-hidden-public"
            defaultMessage={`This will make your carpool offer public again.`}
          />
        </p>
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
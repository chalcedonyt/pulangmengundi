import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Glyphicon, Button, Modal, Alert} from 'react-bootstrap'
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'

export default class OutgoingSponsorModal extends Component {
  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="sponsor.redirect-title"
              defaultMessage={`You are being redirected to our strategic partner {outgoing}.`}
              values={{
                outgoing: this.props.outgoingSponsor
              }}
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert bsStyle='warning'>
            <p>
              <FormattedHTMLMessage
                id="sponsor.redirect-warning-1"
                defaultMessage={`If you have not created a listing on our site, <strong>please do so.</strong>`}
              />
            </p>
            <p>
              <FormattedHTMLMessage
                id="sponsor.redirect-warning-2"
                defaultMessage={`Sponsor tickets or partner processes may have a verification delay and may have limited seats. To increase your chances, create a listing here before going to the sponsor site.`}
              />
            </p>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='success' target='_blank' onClick={this.props.onProceed} href={this.props.outgoingSponsorHref}>
            <FormattedMessage
              id="btn-proceed-sponsor"
              defaultMessage={`Proceed to partner`}
            />
            <Glyphicon glyph='chevron-right' />
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
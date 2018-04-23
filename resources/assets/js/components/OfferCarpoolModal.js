import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Alert, Modal, Row, Col, Button} from 'react-bootstrap'
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'
import Disclaimer from './shared/Disclaimer'

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
        <Alert>
          <p>
            <FormattedMessage
              id="request.submit-warning"
              defaultMessage={`By submitting this offer/request, you allow us to send you email updates about matched drivers/passengers, and to create Whatsapp groups matching you to drivers/passengers.`}
            />
          </p>
          <br />
          <p>
            <FormattedMessage
              id="request.submit-warning-1"
              defaultMessage={`You also acknowledge and have read our terms and conditions as found {link}`}
              values={{
                'link': <strong><a target="_blank" href='https://www.pulangmengundi.com/terms.html'>pulangmengundi.com/terms.html</a></strong>
              }}
            />
          </p>
          <br />
          <p>
            <FormattedMessage
              id="offer.info-warning"
              defaultMessage={`Your name, location and times will be shown to users who match your district or state, and vice-versa. They will be able to request your contact information.`}
            />
          </p>
        </Alert>
        <Disclaimer />
        <Row>
          {Array.isArray(this.props.offers) && this.props.offers.map((offer, i) => (
            <Col md={6} xs={6} key={i}>
              { i == 0 ?
                <strong>
                  <FormattedMessage
                    id="request.header-i-from"
                    defaultMessage={`Starting`}
                  />:
                </strong>
              : <strong>
                  <FormattedMessage
                    id="request.header-i-to"
                    defaultMessage={`Returning`}
                  />:
                </strong>

              }
              <p>
                {offer.startLocation.name} ({offer.startLocation.state})
              </p>
              <p>
              {offer.endLocation.name} ({offer.endLocation.state})
              </p>
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
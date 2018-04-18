import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Alert, Modal, Row, Col, Button} from 'react-bootstrap'
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'

export default class NeedCarpoolConfirmModal extends Component {

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage
            id="request.dialog-header-confirm"
            defaultMessage={`Confirm request`}
          />
        </Modal.Title>
      </Modal.Header>
      {this.props.show &&
        <Modal.Body>
          <h4>
            <FormattedMessage
              id="request.dialog-header-submit-question"
              defaultMessage={`Submit carpool request?`}
            />
          </h4>
          <Alert>
            <p>
              <FormattedMessage
                id="request.submit-warning"
                defaultMessage={`By submitting this offer/request, you allow us to send you email updates about matched drivers/passengers, and to create Whatsapp groups matching you to drivers/passengers.`}
              />
            </p><br />
            <p>
              <FormattedMessage
                id="request.submit-warning-1"
                defaultMessage={`You also acknowledge and have read our terms and conditions as found {link}`}
                values={{
                  'link': <strong><a target="_blank" href='https://www.pulangmengundi.com/terms.html'>pulangmengundi.com/terms.html</a></strong>
                }}
              />
            </p><br />
            <p>
              <FormattedMessage
                id="request.dialog-info-1"
                defaultMessage={`You will be shown other voters who are travelling the same way as you, and vice-versa. They will be able to request your contact information.`}
              />
            </p>
          </Alert>
          <strong>
            <FormattedMessage
              id="request.header-i-from"
              defaultMessage={`I am currently in`}
            />:
          </strong>
          <p>
            {this.props.fromLocation.name} ({this.props.fromLocation.state})
          </p>
          <strong>
            <FormattedMessage
              id="request.header-i-going"
              defaultMessage={`I am voting in`}
            />:
          </strong>
          <p>
            {this.props.pollLocation.name} ({this.props.pollLocation.state}) <br />
          </p>
          <strong>
            <FormattedMessage
              id="request.header-my-gender"
              defaultMessage={`My gender is`}
            />
          </strong>
          <p>
          {this.props.gender}
          </p>
        </Modal.Body>
      }
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
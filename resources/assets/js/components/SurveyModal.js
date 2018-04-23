import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Alert, Modal, Button} from 'react-bootstrap'
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'
import api from '../utils/api'

export default class SurveyModal extends Component {
  constructor(props) {
    super(props)
    this.handleWentToSurvey = this.handleWentToSurvey.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleWentToSurvey() {
    api.updateSurveyStatus(1)
    .then(() => this.props.onCancel())
  }

  handleCancel () {
    api.updateSurveyStatus(2)
    .then(() => this.props.onCancel())
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.handleCancel}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage
            id="survey.header"
            defaultMessage={`Can you spare one minute to take a survey?`}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert bsStyle='success'>
          <p>
            <FormattedMessage
              id="survey.cta"
              defaultMessage={`We notice that you have an outstanding listing, and we are trying to improve the matching experience for all drivers and riders.
              Your feedback will help a lot!`}
            />
          </p>
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        {this.props.isDriver ?
        <div>
          <Button target='_blank' onClick={this.handleWentToSurvey} href='https://www.surveymonkey.com/r/6SJ3LYV'>
            Go to driver survey (EN)
          </Button>
          <Button target='_blank' onClick={this.handleWentToSurvey} href='https://www.surveymonkey.com/r/6M7NXNH'>
            Buka kaji selidik pemandu (BM)
          </Button>
        </div>
        :
        <div>
          <Button target='_blank' onClick={this.handleWentToSurvey} href='https://www.surveymonkey.com/r/63JPDXT'>
            Go to rider survey (EN)
          </Button>
          <Button target='_blank' onClick={this.handleWentToSurvey} href='https://www.surveymonkey.com/r/6PPM823'>
            Buka kaji selidik pemumpang (BM)
          </Button>
        </div>
        }
      </Modal.Footer>
    </Modal>
    )
  }
}
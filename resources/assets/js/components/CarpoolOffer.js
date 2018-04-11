import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Col, Grid, Panel, Row} from 'react-bootstrap'
import HideOfferModal from './HideOfferModal'
import UnhideOfferModal from './UnhideOfferModal'
import moment from 'moment'

export default class CarpoolOffer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offer: props.offer,
      isOwner: props.isOwner || false,
      //the modal to hide the offer
      showHideModal: false,
      showUnhideModal: false
    }
    this.handleHideOffer = this.handleHideOffer.bind(this)
    this.handleUnhideOffer = this.handleUnhideOffer.bind(this)
    this.setHideModal = this.setHideModal.bind(this)
  }

  handleHideOffer() {
    api.hideOffer(this.state.offer.id)
    .then(() => this.props.onChange())
  }

  handleUnhideOffer() {
    api.unhideOffer(this.state.offer.id)
    .then(() => this.props.onChange())
  }

  setHideModal(showHideModal) {
    this.setState({
      showHideModal
    })
  }

  setUnhideModal(showUnhideModal) {
    this.setState({
      showUnhideModal
    })
  }

  render() {
    return (
      <Panel>
        <Panel.Body>
          <Row>
            <Col md={4}>
              <Row>
                <Col md={6} mdOffset={3}>
                  <img src={this.state.offer.user.avatar_url} />
                </Col>
              </Row>
              <Row>
                <Col md={8} mdOffset={2}>
                  <p>
                    <strong>{this.state.offer.user.name}</strong>
                  </p>
                </Col>
              </Row>
            </Col>
            <Col md={8}>
              <div>
                <strong>Leaving from:</strong>
                <p>
                  {this.state.offer.location_from.name}, {this.state.offer.location_from.state}
                </p>
                <strong>To:</strong>
                <p>
                {this.state.offer.location_to.name}, {this.state.offer.location_to.state}
                </p>
                <strong>Time:</strong>
                <p>{this.state.offer.leave_at_formatted}</p>
                {this.state.offer.gender_preference &&
                <div>
                  <strong>Gender preference:</strong>
                  <p>{this.state.offer.gender_preference}</p>
                </div>}
                {this.state.offer.information &&
                  <div>
                    <strong>Additional information:</strong>
                    <p>{this.state.offer.information}</p>
                  </div>}
              </div>
            </Col>
          </Row>
        </Panel.Body>
        <Panel.Footer>
          {this.state.isOwner &&
          <div>
            {this.state.offer.hidden == 0 &&
              <div>
                <Button bsStyle='info' onClick={(e) => this.setHideModal(true)}>Hide Offer</Button>
                <Button bsStyle='danger'>Cancel Offer</Button>
              </div>
            }
            {this.state.offer.hidden == 1 &&
            <div>
              <p><strong>This offer is hidden</strong></p>
              <Button bsStyle='success' onClick={(e) => this.setUnhideModal(true)}>Show Offer Again</Button>
            </div>
            }
          </div>
          }
          {!this.state.isOwner &&
          <Button bsStyle='success'>Contact</Button>
          }
          <HideOfferModal show={this.state.showHideModal} onOK={this.handleHideOffer} onCancel={(e) => this.setHideModal(false)} />
          <UnhideOfferModal show={this.state.showUnhideModal} onOK={this.handleUnhideOffer} onCancel={(e) => this.setUnhideModal(false)} />
        </Panel.Footer>
      </Panel>
    )
  }
}
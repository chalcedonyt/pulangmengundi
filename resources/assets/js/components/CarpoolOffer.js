import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Alert, Button, Col, Grid, Panel, Row} from 'react-bootstrap'
import HideOfferModal from './HideOfferModal'
import UnhideOfferModal from './UnhideOfferModal'
import CancelOfferModal from './CancelOfferModal'
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
    this.handleCancelOffer = this.handleCancelOffer.bind(this)
    this.setHideModal = this.setHideModal.bind(this)
    this.setCancelModal = this.setCancelModal.bind(this)
  }

  handleHideOffer() {
    api.hideOffer(this.state.offer.id)
    .then(() => this.props.onChange())
  }

  handleUnhideOffer() {
    api.unhideOffer(this.state.offer.id)
    .then(() => this.props.onChange())
  }

  handleCancelOffer() {
    api.cancelOffer(this.state.offer.id)
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

  setCancelModal(showCancelModal) {
    this.setState({
      showCancelModal
    })
  }

  render() {
    return (
      <Panel>
        <Panel.Heading>
          <Row>
            <Col md={3} xs={3}>
              <img width={40} src={this.state.offer.user.avatar_url} />
            </Col>
            <Col md={8} mdOffset={1} xs={8} xsOffset={1}>
              <h4>{this.state.offer.user.name}</h4>
            </Col>
          </Row>
        </Panel.Heading>
        <Panel.Body>
          <div>
            <strong>Leaving from:</strong>
            <p>
              {this.state.offer.fromLocation.name}, {this.state.offer.fromLocation.state}
            </p>
            <strong>To:</strong>
            <p>
            {this.state.offer.toLocation.name}, {this.state.offer.toLocation.state}
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
        </Panel.Body>
        <Panel.Footer>
          {this.state.isOwner &&
          <div>
            {this.state.offer.hidden == 0 &&
              <div>
                <Button bsStyle='info' onClick={(e) => this.setHideModal(true)}>Hide Offer</Button>
                <Button bsStyle='danger' onClick={(e) => this.setCancelModal(true)}>Cancel Offer</Button>
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
          <Button bsStyle='success' onClick={(e) => this.props.onContact(this.state.offer.user)}>Contact</Button>
          }
          <HideOfferModal show={this.state.showHideModal} onOK={this.handleHideOffer} onCancel={(e) => this.setHideModal(false)} />
          <UnhideOfferModal show={this.state.showUnhideModal} onOK={this.handleUnhideOffer} onCancel={(e) => this.setUnhideModal(false)} />
          <CancelOfferModal show={this.state.showCancelModal} onOK={this.handleCancelOffer} onCancel={(e) => this.setCancelModal(false)} />
        </Panel.Footer>
      </Panel>
    )
  }
}
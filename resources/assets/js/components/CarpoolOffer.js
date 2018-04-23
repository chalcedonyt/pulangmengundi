import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Alert, Button, Col, Grid, Image, Panel, Row} from 'react-bootstrap'
import HideOfferModal from './HideOfferModal'
import UnhideOfferModal from './UnhideOfferModal'
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'
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
    this.handleOfferSuccess = this.handleOfferSuccess.bind(this)
    this.handleUnhideOffer = this.handleUnhideOffer.bind(this)
    this.handleCancelOffer = this.handleCancelOffer.bind(this)
    this.setHideModal = this.setHideModal.bind(this)
    this.setCancelModal = this.setCancelModal.bind(this)
  }

  handleOfferSuccess() {
    api.offerSuccess(this.state.offer.id)
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
            <Col md={1} sm={1} xs={2}>
              <Image  className='listing-img' responsive src={this.state.offer.user.avatar_url} />
            </Col>
            <Col md={9} mdOffset={1} smOffset={1} sm={910} xs={9} xsOffset={1}>
              <h4>{this.state.offer.user.name}</h4>
            </Col>
          </Row>
        </Panel.Heading>
        <Panel.Body>
          <div>
            <strong>
              <FormattedMessage
                id="request.travel-from-header"
                defaultMessage={`Travelling from`}
              />:
            </strong>
            <p>
              {this.state.offer.fromLocation.name}, {this.state.offer.fromLocation.state}
            </p>
            <strong>
              <FormattedMessage
                id="request.travel-to-header"
                defaultMessage={`Travelling to`}
              />:
            </strong>
            <p>
            {this.state.offer.toLocation.name}, {this.state.offer.toLocation.state}
            </p>
            <strong>
              <FormattedMessage
                id="request.travelling-time"
                defaultMessage={`Travelling at`}
              />:
            </strong>
            <p>{this.state.offer.leave_at_formatted}</p>
            {this.state.offer.leave_polls_at_formatted &&
              <div>
                <strong>
                  <FormattedMessage
                    id="request.travelling-return-time"
                    defaultMessage={`Returning at`}
                  />:
                </strong>
                <p>{this.state.offer.leave_polls_at_formatted}</p>
              </div>
            }
            {this.state.offer.gender_preference &&
            <div>
              <strong>
                <FormattedMessage
                  id="request.gender-pref"
                  defaultMessage={`Gender preference`}
                />:
              </strong>
              <p>{this.state.offer.gender_preference}</p>
            </div>}
            {this.state.offer.information &&
              <div>
                <strong>
                  <FormattedMessage
                    id="request.additional-info"
                    defaultMessage={`Additional information`}
                  />:
                </strong>
                <p>{this.state.offer.information}</p>
              </div>}
          </div>
        </Panel.Body>
        <Panel.Footer>
          {this.state.isOwner &&
          <div>
            {this.state.offer.hidden == 0 &&
              <div>
                <Button bsStyle='success' onClick={(e) => this.setHideModal(true)}>
                  <FormattedHTMLMessage
                    id="btn-close-offer"
                    defaultMessage={`I have matched a passenger!/<br /> Close offer`}
                  />
                </Button>
              </div>
            }
            {this.state.offer.hidden == 1 &&
            <div>
              <p>
                <strong>
                  <FormattedMessage
                    id="request.request-fulfilled"
                    defaultMessage={`This offer was fulfilled!`}
                  />
                </strong></p>
              <Button bsStyle='success' onClick={(e) => this.setUnhideModal(true)}>
                <FormattedMessage
                  id="request.show-again"
                  defaultMessage={`Show offer again`}
                />
              </Button>
            </div>
            }
          </div>
          }
          {!this.state.isOwner &&
          <Button bsStyle='success' onClick={(e) => this.props.onContact(this.state.offer.user)}>
            <FormattedMessage
              id="btn-contact"
              defaultMessage={`Contact`}
            />
          </Button>
          }
          <HideOfferModal
            show={this.state.showHideModal}
            onOfferSuccess={this.handleOfferSuccess}
            onOfferCancel={this.handleCancelOffer}
            onCancel={(e) => this.setHideModal(false)}
          />
          <UnhideOfferModal show={this.state.showUnhideModal} onOK={this.handleUnhideOffer} onCancel={(e) => this.setUnhideModal(false)} />
        </Panel.Footer>
      </Panel>
    )
  }
}
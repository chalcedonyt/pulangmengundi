import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Alert, Button, Checkbox, Col, Grid, Row, Panel} from 'react-bootstrap'
import CarpoolOffer from './CarpoolOffer'
import CarpoolNeed from './CarpoolNeed'
import ContactModal from './ContactModal'
import { isMobile, MobileView, BrowserView } from "react-device-detect";
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'

export default class MyCarpoolNeedMyCarpoolNeed extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offers: null,
      need: null,
      showContactModal: false,
      selectedUser: {},
    }
    this.handleContactUser = this.handleContactUser.bind(this)
    this.handleNeedSuccess = this.handleNeedSuccess.bind(this)
    this.handleCancelNeed = this.handleCancelNeed.bind(this)
  }

  componentDidMount() {
    api.getNeed()
    .then((need) => {
      this.setState({
        need
      }, () => {
        api.getLocationMatches()
        .then(({offers}) => {
          this.setState({
            offers
          })
        })
      })
    })
  }

  handleContactUser(user) {
    this.setState({
      selectedUser: user,
      showContactModal: true
    })
  }

  handleNeedSuccess() {
    api.needSuccess(this.state.need.id)
    .then(() => {
      window.location = window.location.pathname
    } )
  }

  handleCancelNeed() {
    api.cancelNeed(this.state.need.id)
    .then(() => {
      window.location = window.location.pathname
    } )
  }

  render() {
    return (
      <div>
        <div className="container">
          <Row>
            <Col md={4}>
              <h3>
                <FormattedMessage
                  id="request.header-your-request"
                  defaultMessage={`Your request`}
                />
              </h3>
              <Alert bsStyle='info'>
                <h4>
                  <FormattedMessage
                    id="request.header-do-what"
                    defaultMessage={`What should I do now?`}
                  />
                </h4>
                <p>
                  <FormattedHTMLMessage
                    id="request.do-what-1"
                    defaultMessage={`You may be contacted by drivers going the same way. If you enabled Facebook as a method of contact, do <strong>actively</strong> check your Friend requests and messages`}
                  />
                </p>
                <p>
                  <FormattedMessage
                    id="request.do-what-2"
                    defaultMessage={`We may send you emails periodically to tell you of new matches.`}
                  />
                </p>
                <p>
                  <FormattedHTMLMessage
                    id="request.do-what-3"
                    defaultMessage={`Check out the <strong><a href='/'>main page</a></strong> as well to search for drivers.`}
                  />
                </p>
              </Alert>
              <CarpoolNeed onNeedSuccess={this.handleNeedSuccess} onNeedCancel={this.handleCancelNeed} need={this.state.need} isOwner={true}/>
            </Col>
            <Col md={8}>
              <h3>
                <FormattedMessage
                  id="request.header-matches"
                  defaultMessage={`Your matches`}
                />
              </h3>
              {this.state.offers && this.state.offers.length == 0 &&
              <Alert bsStyle='info'>
                <p>
                  <FormattedMessage
                    id="request.no-match"
                    defaultMessage={`There is no one matching your travel locations. Check back later!`}
                  />
                </p>
                <p>
                  <FormattedMessage
                    id="request.we-try"
                    defaultMessage={`We will try to match you with anyone travelling from the same states.`}
                  />
                </p>
              </Alert>
              }
              <BrowserView device={!isMobile}>
                <Panel>
                  <Panel.Body>
                    <Grid fluid>
                    {this.state.offers && this.state.offers.length > 0 && this.state.offers.map((offer, i) => (
                      <Col key={offer.id} md={6}>
                        <CarpoolOffer onContact={this.handleContactUser} offer={offer} />
                      </Col>
                    ))}
                    </Grid>
                  </Panel.Body>
                </Panel>
              </BrowserView>
              {this.state.showContactModal
              && <ContactModal show={this.state.showContactModal} user={this.state.selectedUser} onCancel={(e) => this.setState({showContactModal: false})} />
              }
            </Col>
          </Row>
          <MobileView device={isMobile}>
            {this.state.offers && this.state.offers.length > 0 && this.state.offers.map((offer, i) => (
                <CarpoolOffer key={offer.id} onContact={this.handleContactUser} offer={offer} />
            ))}
          </MobileView>
        </div>
      </div>
    )
  }
}
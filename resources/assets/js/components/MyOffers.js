import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Alert, Grid, Row, Col, Panel} from 'react-bootstrap'
import CarpoolOffer from './CarpoolOffer'
import CarpoolNeed from './CarpoolNeed'
import ContactModal from './ContactModal'
import { isMobile, MobileView, BrowserView } from "react-device-detect";
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'

export default class MyOffers extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offer: null,
      showContactModal: false,
      needs: []
    }

    this.load = this.load.bind(this)
    this.handleContactUser = this.handleContactUser.bind(this)
  }

  componentDidMount() {
    this.load()
  }

  load() {
    api.getMyOffers()
    .then((data) => {
      this.setState({
        offer: data
      }, () => {
        api.getOfferMatches()
        .then(({needs}) => {
          this.setState({
            needs
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

  render() {
    return (
      <div>
        <h1>
          <FormattedMessage
            id="offer.header-your-offers"
            defaultMessage={`Your carpool offers`}
          />
        </h1>
        <Alert bsStyle="info">
          <h4>
            <FormattedMessage
              id="offer.header-do-what"
              defaultMessage={`What should I do now?`}
            />
          </h4>
          <p>
            <FormattedHTMLMessage
              id="offer.do-what-1"
              defaultMessage={`You may be contacted by riders going the same way. If you enabled Facebook as a method of contact, do <strong>actively</strong> check your Friend requests and messages`}
            />
          </p>
          <p>
            <FormattedMessage
              id="offer.do-what-2"
              defaultMessage={`If you have an open offer, we may send you emails periodically to tell you of new matches.`}
            />
          </p>
        </Alert>
        <Row>
          <Col md={4}>
          {this.state.offer &&
            <CarpoolOffer onChange={() => { window.location.reload() }} offer={this.state.offer} isOwner={true}/>
          }
          </Col>
          <Col md={8}>
            <BrowserView device={!isMobile}>
            <Panel>
              <Panel.Heading>
                <h3>
                  <FormattedMessage
                    id="offer.header-matches"
                    defaultMessage={`Your matches`}
                  />
                </h3>
              </Panel.Heading>
              <Panel.Body>
                <Alert bsStyle='info'>
                  <p>
                    <FormattedHTMLMessage
                      id="offer.your-matches-info"
                      defaultMessage={`Carpool requests from riders that match you are shown here. You can also check the <strong><a href='/'>main page</a></strong> to search for riders.`}
                    />
                  </p>
                </Alert>
                {this.state.needs && this.state.needs.length == 0 &&
                <Alert bsStyle='info'>
                  <p>
                    <FormattedMessage
                      id="offer.no-match-1"
                      defaultMessage={`There is no one matching your travel locations. Check back later!`}
                    />
                  </p>
                  <p>
                    <FormattedMessage
                      id="offer.no-match-2"
                      defaultMessage={`We will try to match you with anyone travelling from the same states.`}
                    />
                  </p>
                </Alert>
                }
                <Grid fluid>
                {this.state.needs && this.state.needs.length > 0 && this.state.needs.map((need, i) => (
                  <Col key={need.id} md={6}>
                    <CarpoolNeed onContact={this.handleContactUser} need={need} />
                  </Col>
                ))}
                </Grid>
              </Panel.Body>
            </Panel>
          </BrowserView>
          <MobileView device={isMobile}>
            <Alert bsStyle='info'>
              <p>
                <FormattedHTMLMessage
                  id="offer.your-matches-info"
                  defaultMessage={`Carpool requests from riders that match you are shown here. You can also check the <strong><a href='/'>main page</a></strong> to search for riders.`}
                />
              </p>
            </Alert>
            {this.state.needs && this.state.needs.length == 0 &&
            <Alert bsStyle='info'>
              <p>
                <FormattedMessage
                  id="offer.no-match-1"
                  defaultMessage={`There is no one matching your travel locations. Check back later!`}
                />
              </p>
              <p>
                <FormattedMessage
                  id="offer.no-match-2"
                  defaultMessage={`We will try to match you with anyone travelling from the same states.`}
                />
              </p>
            </Alert>
            }
            {this.state.needs && this.state.needs.length > 0 && this.state.needs.map((need, i) => (
                <CarpoolNeed key={need.id} onContact={this.handleContactUser} need={need} />
            ))}
          </MobileView>
          </Col>
        </Row>
        {this.state.showContactModal
        && <ContactModal show={this.state.showContactModal} user={this.state.selectedUser} onCancel={(e) => this.setState({showContactModal: false})} />
        }
      </div>
    )
  }
}
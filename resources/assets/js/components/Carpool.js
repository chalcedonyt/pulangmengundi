import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Alert, Button, Col, Grid, Glyphicon, Image, Jumbotron, Row, Panel, PanelGroup} from 'react-bootstrap'
import CarpoolOffer from './CarpoolOffer'
import CarpoolNeed from './CarpoolNeed'
import ContactModal from './ContactModal'
import OutgoingSponsorModal from './OutgoingSponsorModal'
import StateSelection from './StateSelection'
import Progress from './Progress'
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'
import { isMobile, MobileView, BrowserView } from "react-device-detect";


export default class Carpool extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offers: [],
      needs: [],
      selectedStateFrom: null,
      selectedStateTo: null,

      showContactModal: false,
      showOutgoingSponsorModal: false,
      outgoingSponsorHref: '',

      selectedUser: {},
      needCount: null,
      offerCount: null,
      isLoading: false,
      showingRiders: false,
      showingDrivers: false,
      sponsorMatches: null,

      driverOffset: 0,
      driverLimit:15,
      riderOffset: 0,
      riderLimit: 15,

    }
    this.handleStateFromChange = this.handleStateFromChange.bind(this)
    this.handleStateToChange = this.handleStateToChange.bind(this)
    this.handleContactUser = this.handleContactUser.bind(this)
    this.resetSelectedStateFrom = this.resetSelectedStateFrom.bind(this)
    this.resetSelectedStateTo = this.resetSelectedStateTo.bind(this)
    this.doSearch = this.doSearch.bind(this)
    this.toggleShowingRiders = this.toggleShowingRiders.bind(this)
    this.toggleShowingDrivers = this.toggleShowingDrivers.bind(this)

    this.loadMoreDrivers = this.loadMoreDrivers.bind(this)
    this.loadMoreRiders = this.loadMoreRiders.bind(this)

    this.toggleOutgoingSponsorModal = this.toggleOutgoingSponsorModal.bind(this)
  }

  componentDidMount() {
    this.doSearch()
  }

  doSearch() {
    var eventLabelProps = []
    if (this.state.selectedStateFrom)
      eventLabelProps.push(`from:${this.state.selectedStateFrom}`)
    if (this.state.selectedStateTo)
      eventLabelProps.push(`to:${this.state.selectedStateTo}`)

    if (eventLabelProps.length) {
      gtag('event', 'homepageSearch', {
        'event_category': 'search',
        'event_label': eventLabelProps.join(',')
      });
    }
    this.setState({
      isLoading: true
    }, () => {
      this.getOffers()
      .then(({offers, meta}) => {
        const offerCount = meta.count
          this.getNeeds()
          .then(({needs, meta}) => {
            const sponsorMatches = (Array.isArray(meta.sponsor_matches) && meta.sponsor_matches.length)
            ? meta.sponsor_matches
            : null

            this.setState({
              sponsorMatches,
              offers,
              offerCount,
              needs,
              needCount: meta.count,
              isLoading: false
            })
          })
        })
    })

  }

  getOffers() {
    const params = {
      state_from: this.state.selectedStateFrom,
      state_to: this.state.selectedStateTo,
    }
    return api.getAllOffers(params).then((response) => response.data)
  }

  getNeeds() {
    const params = {
      state_from: this.state.selectedStateFrom,
      state_to: this.state.selectedStateTo,
    }
    return api.getAllNeeds(params).then((response) => response.data)
  }

  handleStateFromChange(state) {
    this.setState({
      selectedStateFrom: state ? state.name : null
    }, () => {
      if (this.state.selectedStateFrom || this.state.selectedStateTo) {
        this.doSearch()
      }
    })
  }

  handleStateToChange(state) {
    this.setState({
      selectedStateTo: state ? state.name : null
    }, () => {
      if (this.state.selectedStateFrom || this.state.selectedStateTo) {
        this.doSearch()
      }
    })
  }

  handleContactUser(user) {
    if (!window.user) {
      location.href='/login'
    }

    this.setState({
      selectedUser: user,
      showContactModal: true
    })
  }

  resetSelectedStateFrom() {
    this.setState({
      selectedStateFrom: null,
    }, () => {
      this.doSearch()
    })
  }

  resetSelectedStateTo() {
    this.setState({
      selectedStateTo: null,
    }, () => {
      this.doSearch()
    })
  }

  toggleShowingDrivers() {
    this.setState({
      showingDrivers: !this.state.showingDrivers
    })
  }

  toggleShowingRiders() {
    this.setState({
      showingRiders: !this.state.showingRiders
    })
  }

  loadMoreDrivers() {
    this.setState({
      driverOffset: this.state.driverOffset+= this.state.driverLimit,
    }, () => {
      const params = {
        state_from: this.state.selectedStateFrom,
        state_to: this.state.selectedStateTo,
        offset: this.state.driverOffset
      }
      api.getAllOffers(params)
      .then((response) => response.data)
      .then(({offers}) => {
        this.setState({
          offers: this.state.offers.concat(offers),
        })
      })
    })
  }

  loadMoreRiders() {
    this.setState({
      riderOffset: this.state.riderOffset+= this.state.riderLimit,
    }, () => {
      const params = {
        state_from: this.state.selectedStateFrom,
        state_to: this.state.selectedStateTo,
        offset: this.state.riderOffset
      }
      api.getAllNeeds(params)
      .then((response) => response.data)
      .then(({needs}) => {
        this.setState({
          needs: this.state.needs.concat(needs)
        })
      })
    })
  }

  toggleOutgoingSponsorModal(href) {
    this.setState({
      outgoingSponsorHref: href,
      showOutgoingSponsorModal: !this.state.showOutgoingSponsorModal
    })
  }

  trackOutgoingSponsor(href) {
    gtag('event', 'OutgoingSponsorLink', {
      event_category: 'UndiRabu',
      event_label: href
    })
  }


  render() {
    const balikUndiHref = `https://balik.undirabu.com/home?utm_campaign=carpool.pulangmengundi.com&utm_medium=home_banner`
    return (
      <div>
        <Jumbotron>
          <Row>
            <Col md={2} mdOffset={0} smOffset={4} sm={4} xs={12} xsOffset={2}>
              <div>
                <Image style={{marginTop: '20px'}} src="/img/car.png" responsive />
              </div>
            </Col>
            <Col md={9} xs={12}>
              <h3>#PulangMengundi #CarpoolGE14</h3>
              <p>
                <FormattedMessage
                  id="home.jumbotron"
                  defaultMessage={`Going back to vote? Split the cost, make new friends. Use our tool to match with voters going in the same direction to #pulangmengundi!`}
                />
              </p>
              <Grid fluid>
                <Row>
                  <Col md={5} xsHidden={true}>
                    <Button bsSize='large' bsStyle='default' href='/offer'>
                      <FormattedMessage
                        id="home.driver-btn"
                        defaultMessage={`(Driver) I want to offer a carpool`}
                      />
                    </Button>
                  </Col>
                  <Col md={5} mdOffset={1} xsHidden={true}>
                    <Button bsSize='large' bsStyle='default' href='/need'>
                      <FormattedMessage
                        id="home.rider-btn"
                        defaultMessage={`(Rider) I am looking for a carpool`}
                      />
                    </Button>
                  </Col>
                  <Col lgHidden={true} mdHidden={true} smHidden={true} xsOffset={1} xs={8}>
                    <Button bsStyle='default' href='/offer'>
                      <FormattedHTMLMessage
                        id="home.driver-btn-small"
                        defaultMessage={`(Driver)<br /> I want to offer a carpool`}
                      />
                    </Button>
                    <br />
                    <br />
                    <Button bsStyle='default' href='/need'>
                      <FormattedHTMLMessage
                        id="home.rider-btn-small"
                        defaultMessage={`(Rider)<br /> I am looking for a carpool`}
                      />
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <br />
                    <Alert bsStyle='info'>
                      <h4>
                        <FormattedMessage
                          id="home.header-update"
                          defaultMessage={`Updates`}
                        />
                      </h4>
                      <FormattedHTMLMessage
                        id="home.changelog"
                        defaultMessage={
                        `<ul>
                          <li>Mon 9am: We have a new collaboration with UndiRabu!</li>
                          <li>Sun 10am: We are starting to send emails to notify riders/drivers of potential matches.</li>
                          <li>Sat 5pm: You can now mark your listing as fulfilled, or cancel it. Please do so as it helps improve our system.</li>
                          <li>Sat 12am: You can now choose to fill in your <strong>contact number</strong> to be shown to others. (Drivers may need to cancel and re-post for this to be reflected)</li>
                        </ul>`}
                      />
                    </Alert>
                  </Col>
                </Row>
              </Grid>
            </Col>
          </Row>
        </Jumbotron>
        <Panel bsStyle='info'>
          <Panel.Body>
            <Grid fluid>
              <Alert bsStyle='info'>
                <Row>
                  <Col md={1} mdOffset={0} xsOffset={4} xs={1} sm={1} smOffset={0}>
                    <Image width='50' src='https://balik.undirabu.com/wp-content/uploads/2018/04/undirabu-logo-300x300.png' />
                  </Col>
                  <Col md={11} xs={12} sm={11}>
                    <h5>
                      <FormattedMessage
                        id="home.undirabu-promo-header"
                        defaultMessage={`New: Undirabu is sponsoring FREE buses to certain locations throughout Malaysia.`}
                      />
                    </h5>
                    <p>
                      <FormattedMessage
                        id="home.undirabu-promo-cta"
                        defaultMessage={`Check them out at {link}, or do a search to see if they have a bus matching your trip!`}
                        values={{
                          'link': <u>
                            <a target='_blank' onClick={(e)=>this.trackOutgoingSponsor(balikUndiHref)} href={balikUndiHref}>balik.undirabu.com</a>
                          </u>
                        }}
                      />
                    </p>

                  </Col>
                </Row>
              </Alert>
              {this.state.sponsorMatches &&
              <Alert bsStyle='success'>
                <h4>
                  <FormattedMessage
                    id="home.undirabu-promo-matched"
                    defaultMessage={`We have a match for your route from Undirabu!`}
                  /> ({this.state.selectedStateFrom} - {this.state.selectedStateTo})</h4>
                <ul>
                  {this.state.sponsorMatches.map((match) => (
                    <li key={match.link}>
                      <u>
                        <a href='javascript:;' onClick={(e)=> this.toggleOutgoingSponsorModal(`${match.link}?utm_campaign=carpool.pulangmengundi.com&utm_medium=home_search`)}>
                          <Glyphicon glyph='chevron-right' />&nbsp;
                          {match.description}
                        </a>
                      </u>
                    </li>
                  ))}
                </ul>
                <OutgoingSponsorModal
                  show={this.state.showOutgoingSponsorModal}
                  outgoingSponsorHref={this.state.outgoingSponsorHref}
                  outgoingSponsor={`balik.undirabu.com`}
                  onProceed={(e)=>this.trackOutgoingSponsor(this.state.outgoingSponsorHref)}
                  onCancel={(e)=>this.toggleOutgoingSponsorModal(null)}
                />
              </Alert>
              }
              <Row>
                <Col md={4} mdOffset={2}>
                  <Panel>
                    <Panel.Heading>
                      <h5>
                        <FormattedMessage
                          id="home.btn-search-from"
                          defaultMessage={`Choose where you are starting from`}
                        />
                      </h5>
                    </Panel.Heading>
                    <Panel.Body>
                      <StateSelection
                        title={'State:'}
                        selectedState={this.state.selectedStateFrom}
                        onChange={this.handleStateFromChange}
                      />
                      {this.state.selectedStateFrom &&
                        <Button bsStyle='link' onClick={this.resetSelectedStateFrom}>
                          <FormattedMessage
                            id="home.btn-search-clear"
                            defaultMessage={`Clear`}
                          />
                        </Button>
                      }
                    </Panel.Body>
                  </Panel>
                </Col>
                <Col md={4}>
                  <Panel>
                    <Panel.Heading>
                      <h5>
                        <FormattedMessage
                          id="home.btn-search-to"
                          defaultMessage={`Choose where you are going to`}
                        />
                      </h5>
                    </Panel.Heading>
                    <Panel.Body>
                      <StateSelection
                        title={'State:'}
                        selectedState={this.state.selectedStateTo}
                        onChange={this.handleStateToChange}
                      />
                      {this.state.selectedStateTo &&
                        <Button bsStyle='link' onClick={this.resetSelectedStateTo}>
                          <FormattedMessage
                            id="home.btn-search-clear"
                            defaultMessage={`Clear`}
                          />
                        </Button>
                      }
                    </Panel.Body>
                  </Panel>
                </Col>
              </Row>
            </Grid>
          </Panel.Body>
        </Panel>
        <Grid fluid>
          <Row>
            <Col md={6}>
              <PanelGroup id='drivers' accordion={isMobile}>
                <Panel eventKey={1} bsStyle='primary'>
                  <Panel.Heading>
                    <Panel.Title toggle>
                      <Row>
                        <Col md={12} xs={10} sm={10}>
                          <h3>
                            {this.state.offerCount}&nbsp;
                            <FormattedMessage
                              id="home.driver-counter"
                              defaultMessage={`Drivers offering carpools`}
                            />&nbsp;&nbsp;
                          </h3>
                        </Col>
                        <Col xs={2} sm={2} className='toggle-chevron-column'>
                          {isMobile && this.state.showingDrivers &&
                          <Button>
                            <Glyphicon glyph='chevron-up' />
                          </Button>
                          }
                          {isMobile && !this.state.showingDrivers &&
                            <Button>
                              <Glyphicon glyph='chevron-down' />
                            </Button>
                          }
                        </Col>
                      </Row>
                    </Panel.Title>
                  </Panel.Heading>
                  <MobileView device={isMobile}>
                    <Panel.Collapse onExit={this.toggleShowingDrivers} onEnter={this.toggleShowingDrivers}>
                      <Panel.Body>
                        {this.state.isLoading && <Progress />}
                        {!this.state.isLoading
                        && this.state.offers
                        && this.state.offers.length > 0
                        && this.state.offers.map((offer) => (
                          <CarpoolOffer offer={offer} key={offer.id} onContact={this.handleContactUser}/>
                        ))}
                        {!this.state.isLoading
                        && this.state.offers
                        && this.state.offers.length == 0
                        && (
                          <Alert bsStyle='info'>
                            <FormattedMessage
                              id="match.no-results"
                              defaultMessage={`No results found`}
                            />
                          </Alert>
                        )}
                        <br />
                        <Row>
                          <Col xsOffset={4} mdOffset={5} smOffset={5} xs={2} md={2} sm={2}>
                          {this.state.offerCount > this.state.offers.length &&
                            <Button onClick={this.loadMoreDrivers}>
                              <FormattedMessage
                                id='pagination-more'
                                defaultMessage={`More`}
                              />
                            </Button>
                          }
                          </Col>
                        </Row>
                      </Panel.Body>
                    </Panel.Collapse>
                  </MobileView>
                  <BrowserView device={!isMobile}>
                    <Panel.Body>
                      {this.state.isLoading && <Progress />}
                      {!this.state.isLoading
                      && this.state.offers
                      && this.state.offers.length > 0
                      && this.state.offers.map((offer) => (
                        <CarpoolOffer offer={offer} key={offer.id} onContact={this.handleContactUser}/>
                      ))}
                      {!this.state.isLoading
                      && this.state.offers
                      && this.state.offers.length == 0
                      && (
                        <Alert bsStyle='info'>
                          <FormattedMessage
                            id="match.no-results"
                            defaultMessage={`No results found`}
                          />
                        </Alert>
                      )}
                      <br />
                      <Row>
                        <Col xsOffset={5} mdOffset={5} smOffset={5} xs={2} md={2} sm={2}>
                        {this.state.offerCount > this.state.offers.length &&
                          <Button onClick={this.loadMoreDrivers}>
                            <FormattedMessage
                              id='pagination-more'
                              defaultMessage={`More`}
                            />
                          </Button>
                        }
                        </Col>
                      </Row>
                    </Panel.Body>
                  </BrowserView>
                </Panel>
              </PanelGroup>
            </Col>
            <Col md={6}>
              <PanelGroup id='riders' accordion={isMobile} onToggle={this.toggleShowingRiders}>
                <Panel eventKey={2} bsStyle='primary'>
                  <Panel.Heading bsStyle='primary'>
                    <Panel.Title toggle>
                      <Row>
                        <Col md={12} xs={10} sm={10}>
                          <h3>
                            {this.state.needCount}&nbsp;
                            <FormattedMessage
                              id="home.rider-counter"
                              defaultMessage={`Riders looking for carpools`}
                            />
                          </h3>
                        </Col>
                        <Col xs={2} sm={2} className='toggle-chevron-column'>
                          {isMobile && this.state.showingRiders &&
                          <Button>
                            <Glyphicon glyph='chevron-up' />
                          </Button>
                          }
                          {isMobile && !this.state.showingRiders &&
                            <Button>
                              <Glyphicon glyph='chevron-down' />
                            </Button>
                          }
                        </Col>
                      </Row>
                    </Panel.Title>
                  </Panel.Heading>
                  <MobileView device={isMobile}>
                    <Panel.Collapse onExit={this.toggleShowingRiders} onEnter={this.toggleShowingRiders}>
                      <Panel.Body>
                        {this.state.isLoading && <Progress />}
                        {!this.state.isLoading
                        && this.state.needs
                        && this.state.needs.length > 0
                        && this.state.needs.map((need) => (
                          <CarpoolNeed need={need} key={need.id} onContact={this.handleContactUser}/>
                        ))}
                        {!this.state.isLoading
                        && this.state.needs
                        && this.state.needs.length == 0
                        && (
                          <Alert bsStyle='info'>
                            <FormattedMessage
                              id="match.no-results"
                              defaultMessage={`No results found`}
                            />
                          </Alert>
                        )}
                        <br />
                        <Row>
                          <Col xsOffset={5} mdOffset={5} smOffset={5} xs={2} md={2} sm={2}>
                          {this.state.needCount > this.state.needs.length &&
                            <Button onClick={this.loadMoreRiders}>More</Button>
                          }
                          </Col>
                        </Row>
                      </Panel.Body>
                    </Panel.Collapse>
                  </MobileView>
                  <BrowserView device={!isMobile}>
                    <Panel.Body>
                      {this.state.isLoading && <Progress />}
                      {!this.state.isLoading
                      && this.state.needs
                      && this.state.needs.length > 0
                      && this.state.needs.map((need) => (
                        <CarpoolNeed need={need} key={need.id} onContact={this.handleContactUser}/>
                      ))}
                      {!this.state.isLoading
                      && this.state.needs
                      && this.state.needs.length == 0
                      && (
                        <Alert bsStyle='info'>
                          <FormattedMessage
                            id="match.no-results"
                            defaultMessage={`No results found`}
                          />
                        </Alert>
                      )}
                      <br />
                      <Row>
                        <Col xsOffset={5} mdOffset={5} smOffset={5} xs={2} md={2} sm={2}>
                        {this.state.needCount > this.state.needs.length &&
                          <Button onClick={this.loadMoreRiders}>More</Button>
                        }
                        </Col>
                      </Row>
                    </Panel.Body>
                  </BrowserView>
                </Panel>
              </PanelGroup>
            </Col>
          </Row>
        </Grid>
        {this.state.showContactModal &&
          <ContactModal show={this.state.showContactModal} user={this.state.selectedUser} onCancel={(e) => this.setState({showContactModal: false, selectedUser: {}})} />
        }
        <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js"></script>
      </div>
    )
  }
}
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Alert, Button, Col, Grid, Glyphicon, Image, Jumbotron, Row, Panel, PanelGroup} from 'react-bootstrap'
import CarpoolOffer from './CarpoolOffer'
import CarpoolNeed from './CarpoolNeed'
import ContactModal from './ContactModal'
import OutgoingSponsorModal from './OutgoingSponsorModal'
import SurveyModal from './SurveyModal'
import StateSelection from './shared/StateSelection'
import Progress from './shared/Progress'
import {FormattedMessage as FM, FormattedHTMLMessage as FHM} from 'react-intl'
import { isMobile, MobileView, BrowserView } from "react-device-detect";
import 'react-count-animation/dist/count.min.css';
import AnimationCount from 'react-count-animation';

export default class Carpool extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offers: [],
      needs: [],
      selectedStateFrom: null,
      selectedStateTo: null,

      showContactModal: false,
      showSurveyModal: false,
      surveyIsDriver: null,
      showOutgoingSponsorModal: false,
      outgoingSponsorHref: '',
      outgoingSponsor: '',

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
      connectionCount: 100

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

    this.showOutgoingSponsorModal = this.showOutgoingSponsorModal.bind(this)
    this.hideOutgoingSponsorModal = this.hideOutgoingSponsorModal.bind(this)
  }

  componentDidMount() {
    if (window.surveyStatus && window.surveyStatus.showRiderSurvey) {
      window.setTimeout (() => {
        this.setState({
          surveyIsDriver: false,
          showSurveyModal: true,
        })
      }, 2000)
    } else if (window.surveyStatus && window.surveyStatus.showDriverSurvey) {
      window.setTimeout (() => {
        this.setState({
          surveyIsDriver: true,
          showSurveyModal: true,
        })
      }, 2000)
    }
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
              isLoading: false,
              connectionCount: meta.connections_count
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

  showOutgoingSponsorModal(sponsor, href) {
    this.setState({
      outgoingSponsorHref: href,
      outgoingSponsor: sponsor,
      showOutgoingSponsorModal: true
    })
  }

  hideOutgoingSponsorModal() {
    this.setState({
      outgoingSponsorHref: '',
      outgoingSponsor: '',
      showOutgoingSponsorModal: false
    })
  }

  trackOutgoingSponsor(sponsor, href) {
    gtag('event', 'OutgoingSponsorLink', {
      event_category: sponsor,
      event_label: href
    })
  }


  render() {
    const balikUndiHref = `https://balik.undirabu.com/home?utm_campaign=carpool.pulangmengundi.com&utm_medium=home_banner`
    const jomBalikUndiHref = `https://docs.google.com/forms/d/e/1FAIpQLSfdgubPKIXMFXOyLBgWfrlrNhGbvfGR1frrxyPslkMouk7eJg/viewform`
    const hasDriverListing = window.userStatus && window.userStatus.hasDriverListing
    const hasRiderListing = window.userStatus && window.userStatus.hasRiderListing
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
              <h2 id='main-header'>
                <FM
                  id='home.jumbotron-connected'
                  defaultMessage={`{number} Malaysians connected!`}
                  values={{
                    number: <AnimationCount
                      start={0}
                      count={this.state.connectionCount}
                      animation='up'
                      useGroup={true}
                      decimals={0}
                      duration={4000}
                    />
                  }}
                />
              </h2>
              <p>
                <FM
                  id="home.jumbotron"
                  defaultMessage={`Going back to vote? Split the cost, make new friends. Use our tool to match with voters going in the same direction to #pulangmengundi!`}
                />
              </p>
              <Grid fluid>
                <Row>
                  <Col md={5} xsHidden={true}>
                    <Button bsSize='large' bsStyle='default' href='/offer'>
                      {!hasDriverListing
                      ? <FM
                        id="home.driver-btn"
                        defaultMessage={`(Driver) I want to offer a carpool`}
                      />
                      : <FM
                        id="home.driver-loggedin-btn"
                        defaultMessage={`(Driver) Manage carpool listing`}
                      />
                    }
                    </Button>
                  </Col>
                  <Col md={5} mdOffset={1} xsHidden={true}>
                    <Button bsSize='large' bsStyle='default' href='/need'>
                    {!hasRiderListing
                      ? <FM
                        id="home.rider-btn"
                        defaultMessage={`(Rider) I am looking for a carpool`}
                      />
                      : <FM
                        id="home.rider-loggedin-btn"
                        defaultMessage={`(Rider) Manage carpool request`}
                      />
                    }
                    </Button>
                    <br />
                    <br />
                  </Col>
                  <Col lgHidden={true} mdHidden={true} smHidden={true} xsOffset={1} xs={7}>
                    <Button bsStyle='default' href='/offer'>
                      <FHM
                        id="home.driver-btn-small"
                        defaultMessage={`(Driver)<br /> I want to offer a carpool`}
                      />
                    </Button>
                    <br />
                    <br />
                    <Button bsStyle='default' href='/need'>
                      <FHM
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
                        <FM
                          id="home.header-update"
                          defaultMessage={`Updates`}
                        />
                      </h4>
                      <FHM
                        id="home.changelog"
                        defaultMessage={
                        `<ul>
                          <li>Mon 5pm: Drivers no longer have separate listings for "to" and "from" trips, which will result in better accuracy.</li>
                          <li>Sat 7pm: Because changes FB has made, you must search for potential matches by name on FB.</li>
                          <li>Mon 9am: We have a new collaboration with balik.undirabu.com!</li>
                          <li>Sat 5pm: You can now mark your listing as fulfilled, or cancel it. Please do so as it helps improve our system.</li>
                        </ul>`}
                      />
                    </Alert>
                  </Col>
                </Row>
              </Grid>
            </Col>
          </Row>
        </Jumbotron>
        <Alert bsStyle='info'>
          <Row>
            <Col md={1} mdOffset={0} xsOffset={4} xs={1} sm={1} smOffset={0}>
              <Image width='50' src='https://balik.undirabu.com/wp-content/uploads/2018/04/undirabu-logo-300x300.png' />
            </Col>
            <Col md={9} xs={12} sm={5}>
              <h5>
                <FM
                  id="home.undirabu-promo-header"
                  defaultMessage={`New: Undirabu is sponsoring FREE buses to certain locations throughout Malaysia.`}
                />
              </h5>
              <p>
                <FM
                  id="home.undirabu-promo-cta"
                  defaultMessage={`Check them out at {link}, or do a search to see if they have a bus matching your trip!`}
                  values={{
                    'link': <u>
                      <a href='javascript:;' onClick={(e)=>this.showOutgoingSponsorModal('UndiRabu', balikUndiHref)}>balik.undirabu.com</a>
                    </u>
                  }}
                />
              </p>
              <br />
            </Col>
          </Row>
        </Alert>
        {this.state.sponsorMatches &&
        <Alert bsStyle='success'>
          <h4>
            <FM
              id="home.undirabu-promo-matched"
              defaultMessage={`We have a match for your route from Undirabu!`}
            /> ({this.state.selectedStateFrom} - {this.state.selectedStateTo})</h4>
          <ul>
            {this.state.sponsorMatches.map((match) => (
              <li key={match.link}>
                <u>
                  <a href='javascript:;' onClick={(e)=> this.showOutgoingSponsorModal('UndiRabu', `${match.link}?utm_campaign=carpool.pulangmengundi.com&utm_medium=home_search`)}>
                    <Glyphicon glyph='chevron-right' />&nbsp;
                    {match.description}
                  </a>
                </u>
              </li>
            ))}
          </ul>
        </Alert>
        }
        <OutgoingSponsorModal
          show={this.state.showOutgoingSponsorModal}
          outgoingSponsorHref={this.state.outgoingSponsorHref}
          outgoingSponsor={this.state.outgoingSponsor}
          onProceed={(e)=>this.trackOutgoingSponsor(this.state.outgoingSponsor, this.state.outgoingSponsorHref)}
          onCancel={(e)=>this.hideOutgoingSponsorModal(null)}
        />
        <Panel>
          <Panel.Heading>
            <h4>
              <FM id='home.header-search'
                defaultMessage={`Carpool search`}
              />
            </h4>
          </Panel.Heading>
          <Panel.Body>
            <Grid fluid>
              <Row>
                <Col md={4} mdOffset={2}>
                  <Panel>
                    <Panel.Heading>
                      <FM
                        id="home.btn-search-from"
                        defaultMessage={`Choose where you are starting from`}
                      />
                    </Panel.Heading>
                    <Panel.Body>
                      <StateSelection
                        title={'State:'}
                        selectedState={this.state.selectedStateFrom}
                        onChange={this.handleStateFromChange}
                      />
                      {this.state.selectedStateFrom &&
                        <Button bsStyle='link' onClick={this.resetSelectedStateFrom}>
                          <FM
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
                      <FM
                        id="home.btn-search-to"
                        defaultMessage={`Choose where you are going to`}
                      />
                    </Panel.Heading>
                    <Panel.Body>
                      <StateSelection
                        title={'State:'}
                        selectedState={this.state.selectedStateTo}
                        onChange={this.handleStateToChange}
                      />
                      {this.state.selectedStateTo &&
                        <Button bsStyle='link' onClick={this.resetSelectedStateTo}>
                          <FM
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
                            <FM
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
                            <FM
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
                              <FM
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
                          <FM
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
                            <FM
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
                            <FM
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
                            <FM
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
                          <FM
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
        {this.state.showSurveyModal &&
          <SurveyModal show={this.state.showSurveyModal} isDriver={this.state.surveyIsDriver} onCancel={(e) => this.setState({showSurveyModal: false})}/>
        }
        <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js"></script>
      </div>
    )
  }
}
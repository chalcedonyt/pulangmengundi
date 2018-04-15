import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Alert, Button, Col, Grid, Image, Jumbotron, Row, Panel} from 'react-bootstrap'
import CarpoolOffer from './CarpoolOffer'
import CarpoolNeed from './CarpoolNeed'
import ContactModal from './ContactModal'
import StateSelection from './StateSelection'
import Progress from './Progress'
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl'


export default class Carpool extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offers: [],
      needs: [],
      selectedStateFrom: null,
      selectedStateTo: null,
      showContactModal: false,
      selectedUser: {},
      needCount: null,
      offerCount: null,
      isLoading: false
    }
    this.handleStateFromChange = this.handleStateFromChange.bind(this)
    this.handleStateToChange = this.handleStateToChange.bind(this)
    this.handleContactUser = this.handleContactUser.bind(this)
    this.resetSelectedStateFrom = this.resetSelectedStateFrom.bind(this)
    this.resetSelectedStateTo = this.resetSelectedStateTo.bind(this)
    this.doSearch = this.doSearch.bind(this)
  }

  componentDidMount() {
    this.doSearch()
  }

  doSearch() {
    this.setState({
      isLoading: true
    }, () => {
      this.getOffers()
      .then(({offers, meta}) => {
        const offerCount = meta.count
          this.getNeeds()
          .then(({needs, meta}) => {
            this.setState({
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

  render() {
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
                      <h4>Updates</h4>
                      <ul>
                        <li>Sun 10am: We are starting to send emails to notify riders/drivers of potential matches.</li>
                        <li>Sat 5pm: You can now mark your listing as fulfilled, or cancel it. Please do so as it helps improve our system.</li>
                        <li>Sat 12am: You can now choose to fill in your <strong>contact number</strong> to be shown to others. (Drivers may need to cancel and re-post for this to be reflected)</li>
                      </ul>
                    </Alert>
                  </Col>
                </Row>
              </Grid>
            </Col>
          </Row>
        </Jumbotron>
        <Grid fluid>
          <Row>
            <Col md={4} mdOffset={1}>
              <Panel>
                <Panel.Heading>
                  <FormattedMessage
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
                  <FormattedMessage
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
        <Grid fluid>
          <Row>
            <Col md={6}>
              <Panel bsStyle='primary'>
                <Panel.Heading>
                  <h3>{this.state.offerCount}&nbsp;
                    <FormattedMessage
                      id="home.driver-counter"
                      defaultMessage={`Drivers offering carpools`}
                    />
                  </h3>
                </Panel.Heading>
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
                </Panel.Body>
              </Panel>
            </Col>
            <Col md={6}>
              <Panel bsStyle='primary'>
                <Panel.Heading bsStyle='primary'>
                  <h3>{this.state.needCount}&nbsp;
                    <FormattedMessage
                      id="home.rider-counter"
                      defaultMessage={`Riders looking for carpools`}
                    />
                  </h3>
                </Panel.Heading>
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
                </Panel.Body>
              </Panel>
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
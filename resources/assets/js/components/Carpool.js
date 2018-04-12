import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Alert, Button, Col, Grid, Jumbotron, Row, Panel} from 'react-bootstrap'
import CarpoolOffer from './CarpoolOffer'
import CarpoolNeed from './CarpoolNeed'
import ContactModal from './ContactModal'
import StateSelection from './StateSelection'

export default class Carpool extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offers: [],
      needs: [],
      selectedStateFrom: null,
      selectedStateTo: null,
      showContactModal: false,
      selectedUser: {}
    }
    this.handleStateFromChange = this.handleStateFromChange.bind(this)
    this.handleStateToChange = this.handleStateToChange.bind(this)
    this.handleContactUser = this.handleContactUser.bind(this)
    this.resetSearch = this.resetSearch.bind(this)
  }

  componentDidMount() {
    this.getOffers();
    this.getNeeds();
  }

  getOffers() {
    const params = {
      state_from: this.state.selectedStateFrom,
      state_to: this.state.selectedStateTo,
    }
    api.getAllOffers(params)
    .then(({offers}) => {
      this.setState({
        offers
      })
    })
  }

  getNeeds() {
    const params = {
      state_from: this.state.selectedStateFrom,
      state_to: this.state.selectedStateTo,
    }
    api.getAllNeeds(params)
    .then(({needs}) => {
      this.setState({
        needs
      })
    })
  }

  handleStateFromChange(state) {
    this.setState({
      selectedStateFrom: state ? state.name : null
    }, () => {
      if (this.state.selectedStateFrom && this.state.selectedStateTo) {
        this.getNeeds()
        this.getOffers()
      }
    })
  }

  handleStateToChange(state) {
    this.setState({
      selectedStateTo: state ? state.name : null
    }, () => {
      if (this.state.selectedStateFrom && this.state.selectedStateTo) {
        this.getNeeds()
        this.getOffers()
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

  resetSearch() {
    this.setState({
      selectedStateFrom: null,
      selectedStateTo: null,
    }, () => {
      this.getOffers()
      this.getNeeds()
    })
  }
  render() {
    return (
      <div>
        <Jumbotron>
          <h1>Carpooling</h1>
          <p>Find someone to carpool to and from your hometown here.</p>
          <Row>
            <Col md={5} xs={12}>
              <Button bsSize='large' bsStyle='default' href='/offer'>I want to offer a carpool</Button>
            </Col>
            <Col md={5} xs={12} mdOffset={1}>
              <Button bsSize='large' bsStyle='default' href='/need'>I am looking for a carpool</Button>
            </Col>
          </Row>
        </Jumbotron>
        <div className='container'>
          <Grid>
            <Row>
              <Col md={4} mdOffset={1}>
                <Panel>
                  <Panel.Heading>
                    Choose where you are starting from
                  </Panel.Heading>
                  <Panel.Body>
                    <StateSelection
                      title={'State:'}
                      selectedState={this.state.selectedStateFrom}
                      onChange={this.handleStateFromChange}
                    />
                  </Panel.Body>
                </Panel>
              </Col>
              <Col md={4}>
                <Panel>
                  <Panel.Heading>
                    Choose where you are going to
                  </Panel.Heading>
                  <Panel.Body>
                    <StateSelection
                      title={'State:'}
                      selectedState={this.state.selectedStateTo}
                      onChange={this.handleStateToChange}
                    />
                    {this.state.selectedStateFrom && this.state.selectedStateTo &&
                      <Button bsStyle='link' onClick={this.resetSearch}>Clear</Button>
                    }
                  </Panel.Body>
                </Panel>
              </Col>
            </Row>
          </Grid>
        </div>
        <Grid>
          <Col md={6}>
            <Panel bsStyle='primary'>
              <Panel.Heading>
                <h3>People offering carpools</h3>
              </Panel.Heading>
              <Panel.Body>
                {this.state.offers && this.state.offers.length > 0 && this.state.offers.map((offer, i) => (
                  <CarpoolOffer offer={offer} key={i} onContact={this.handleContactUser}/>
                ))}
                {this.state.offers && this.state.offers.length == 0 && (
                  <Alert bsStyle='info'>No results found</Alert>
                )}
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={6}>
            <Panel bsStyle='primary'>
              <Panel.Heading bsStyle='primary'>
                <h3>People looking for carpools</h3>
              </Panel.Heading>
              <Panel.Body>
                {this.state.needs && this.state.needs.length > 0 && this.state.needs.map((need, i) => (
                  <CarpoolNeed need={need} key={i} onContact={this.handleContactUser}/>
                ))}
                {this.state.needs && this.state.needs.length == 0 && (
                  <Alert bsStyle='info'>No results found</Alert>
                )}
              </Panel.Body>
            </Panel>
          </Col>
        </Grid>
        <ContactModal show={this.state.showContactModal} user={this.state.selectedUser} onCancel={(e) => this.setState({showContactModal: false})} />
      </div>
    )
  }
}
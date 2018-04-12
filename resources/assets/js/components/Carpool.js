import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Alert, Button, Col, Grid, Image, Jumbotron, Row, Panel} from 'react-bootstrap'
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
          <Row>
            <Col md={2} mdOffset={0} smOffset={4} sm={4} xs={12} xsOffset={2}>
              <div>
                <Image style={{marginTop: '20px'}} src="/img/car.png" responsive />
              </div>
            </Col>
            <Col md={9} xs={12}>
              <h3>#PulangMengundi #CarpoolGE14 Carpooling</h3>
              <p>Going back to vote? Split the cost, make new friends. Use our tool to match with voters going in the same direction to #pulangmengundi!</p>
              <Grid fluid>
                <Row>
                  <Col md={5} xsHidden={true}>
                    <Button bsSize='large' bsStyle='default' href='/offer'>(Driver) I want to offer a carpool</Button>
                  </Col>
                  <Col md={5} mdOffset={1} xsHidden={true}>
                    <Button bsSize='large' bsStyle='default' href='/need'>(Passenger) I am looking for a carpool</Button>
                  </Col>
                  <Col lgHidden={true} mdHidden={true} smHidden={true} xsOffset={1} xs={8}>
                    <Button bsStyle='default' href='/offer'>(Driver)<br />I want to offer a carpool</Button>
                    <br />
                    <br />
                    <Button bsStyle='default' href='/need'>(Passenger)<br />I am looking for a carpool</Button>
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
        <Grid fluid>
          <Row>
            <Col md={6}>
              <Panel bsStyle='primary'>
                <Panel.Heading>
                  <h3>Drivers offering carpools</h3>
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
                  <h3>Passengers looking for carpools</h3>
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
          </Row>
        </Grid>
        {this.state.showContactModal &&
          <ContactModal show={this.state.showContactModal} user={this.state.selectedUser} onCancel={(e) => this.setState({showContactModal: false, selectedUser: {}})} />
        }
      </div>
    )
  }
}
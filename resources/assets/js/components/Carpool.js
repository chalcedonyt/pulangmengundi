import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Button, Col, Jumbotron, Row, Panel} from 'react-bootstrap'

export default class Carpool extends Component {
  render() {
    return (
      <div>
        <Jumbotron>
          <h1>Carpooling</h1>
          <p>Find someone to carpool to and from your hometown here.</p>
          <Row>
            <Col md={5} xs={5}>
              <Button bsSize='large' bsStyle='primary' href='/carpool/offer'>I want to offer a carpool</Button>
            </Col>
            <Col md={5} xs={5} xsOffset={1} mdOffset={1}>
              <Button bsSize='large' bsStyle='info' href='/carpool/need'>I am looking for a carpool</Button>
            </Col>
          </Row>
        </Jumbotron>
      </div>
    )
  }
}
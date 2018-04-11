import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Button, Col, Grid, Panel, Row} from 'react-bootstrap'

export default class CarpoolNeed extends Component {

  render() {
    return (
      <Panel>
        <Panel.Body>
          {this.props.need &&
          <Row>
          <Col md={4}>
            <Row>
              <Col md={6} mdOffset={3}>
                <img src={this.props.need.user.avatar_url} />
              </Col>
            </Row>
            <Row>
              <Col md={8} mdOffset={2}>
                <p>
                  <strong>{this.props.need.user.name}</strong>
                </p>
              </Col>
            </Row>
          </Col>
          <Col md={8}>
            <div>
              <strong>Travelling from:</strong>
              <p>{this.props.need.fromLocation.name} ({this.props.need.fromLocation.state})</p>
              <strong>Voting at:</strong>
              <p>{this.props.need.pollLocation.name} ({this.props.need.pollLocation.state})</p>
              <strong>Gender:</strong>
              <p>{this.props.need.gender}</p>
              <strong>Information:</strong>
              <p>{this.props.need.information}</p>
            </div>
          </Col>
        </Row>
        }
        </Panel.Body>
        {this.props.isOwner &&
        <Panel.Footer>
          <Button bsStyle='info' href='/carpool/need'>Edit</Button>
        </Panel.Footer>
        }
        {!this.props.isOwner &&
        <Panel.Footer>
          <Button bsStyle='success'>Contact</Button>
        </Panel.Footer>
        }
      </Panel>
    )
  }
}
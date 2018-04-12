import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Button, Col, Grid, Panel, Row} from 'react-bootstrap'

export default class CarpoolNeed extends Component {

  render() {
    return (
      <Panel>
        <Panel.Heading>
        {this.props.need &&
          <Row>
            <Col md={3}>
              <img width={40} src={this.props.need.user.avatar_url} />
            </Col>
            <Col md={7} mdOffset={1}>
              <h4>{this.props.need.user.name}</h4>
            </Col>
          </Row>
        }
        </Panel.Heading>
        <Panel.Body>
          {this.props.need &&
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
        }
        </Panel.Body>
        {this.props.isOwner &&
        <Panel.Footer>
          <Button bsStyle='info' href='/need'>Edit</Button>
        </Panel.Footer>
        }
        {!this.props.isOwner &&
        <Panel.Footer>
          <Button bsStyle='success' onClick={(e) => this.props.onContact(this.props.need.user)}>Contact</Button>
        </Panel.Footer>
        }
      </Panel>
    )
  }
}
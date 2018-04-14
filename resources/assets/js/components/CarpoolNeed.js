import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Button, Col, Grid, Image, Panel, Row} from 'react-bootstrap'
import CloseNeedModal from './CloseNeedModal'

export default class CarpoolNeed extends Component {

  constructor(props) {
    super(props)
    this.state = {
      showCloseModal: false
    }
    this.setCloseModal = this.setCloseModal.bind(this)
  }

  setCloseModal(showCloseModal) {
    this.setState({
      showCloseModal
    })
  }

  render() {
    return (
      <Panel>
        <Panel.Heading>
        {this.props.need &&
          <Row>
            <Col md={1} sm={1} xs={2}>
              <Image  className='listing-img' responsive src={this.props.need.user.avatar_url} />
            </Col>
            <Col md={9} mdOffset={1} smOffset={1} sm={9} xs={9} xsOffset={1}>
              <h4>{this.props.need.user.name}</h4>
            </Col>
          </Row>
        }
        </Panel.Heading>
        <Panel.Body>
          {this.props.need &&
          <div>
            <strong>Travelling from:</strong>
            <p>{this.props.need.fromLocation.name}, {this.props.need.fromLocation.state}</p>
            <strong>Voting at:</strong>
            <p>{this.props.need.pollLocation.name}, {this.props.need.pollLocation.state}</p>
            <strong>Gender:</strong>
            <p>{this.props.need.gender}</p>
            <strong>Information:</strong>
            <p>{this.props.need.information}</p>
          </div>
        }
        </Panel.Body>
        {this.props.isOwner && this.props.need && !this.props.need.fulfilled &&
        <Panel.Footer>
          <Button bsStyle='info' href='/need'>Edit</Button>
          <Button bsStyle='success' onClick={(e)=> this.setCloseModal(true)}>Close/Cancel</Button>
        </Panel.Footer>
        }
        {this.props.isOwner && this.props.need && this.props.need.fulfilled == 1 &&
        <Panel.Footer>
          <Button bsStyle='success'>Request fulfilled! :)</Button>
        </Panel.Footer>
        }
        {!this.props.isOwner &&
        <Panel.Footer>
          <Button bsStyle='success' onClick={(e) => this.props.onContact(this.props.need.user)}>Contact</Button>
        </Panel.Footer>
        }
        <CloseNeedModal show={this.state.showCloseModal} onNeedCancel={this.props.onNeedCancel} onNeedSuccess={this.props.onNeedSuccess} onCancel={(e) => this.setCloseModal(false)} />
      </Panel>
    )
  }
}
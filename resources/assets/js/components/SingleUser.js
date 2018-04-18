import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import ContactModal from './ContactModal'
import {FormattedMessage as FM} from 'react-intl'
import {Button, Panel, Col, Row} from 'react-bootstrap'
import api from '../utils/api'
import Progress from './shared/Progress'

export default class SingleUser extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      showModal: true,
      isLoading: false
    }

    this.handleModalClose = this.handleModalClose.bind(this)
    this.handleModalShow = this.handleModalShow.bind(this)
  }

  componentDidMount() {
    this.setState({
      isLoading: true
    }, () => {
      api.getUserByToken(this.props.match.params.token)
      .then((user) => {
        this.setState({
          user,
          isLoading: false
        })
      })
    })
  }

  handleModalClose() {
    this.setState({showModal: false})
  }

  handleModalShow() {
    this.setState({
      showModal: true
    })
  }

  render() {
    return (
      <Panel>
        <Panel.Heading>
          <h4>
            <FM
              id='single.show-profile'
              defaultMessage={`Showing user profile`}
            />
          </h4>
        </Panel.Heading>
        <Panel.Body>
          <Row>
            {this.state.user &&
            <Col md={4} mdOffset={2} smOffset={1} sm={4} xsOffset={1} xs={6}>
              <Button bsStyle='success' onClick={this.handleModalShow}>
                <FM
                  id='btn-show-profile'
                  defaultMessage={`Show contact for `}
                /> {this.state.user.name}
              </Button>
              <ContactModal
                show={this.state.showModal}
                user={this.state.user}
                onCancel={this.handleModalClose}
              />
              <br /><br />
            </Col>
            }
            <Col md={4} sm={4}>
              <Button href='/'>
                <FM
                  id='btn-back-to'
                  defaultMessage={`Back to`}
                /> carpool.pulangmengundi.com
              </Button>
            </Col>
          </Row>
        </Panel.Body>
      </Panel>
    )
  }
}
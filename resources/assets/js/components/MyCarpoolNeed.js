import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Checkbox, Col, Grid, Row, Panel} from 'react-bootstrap'
import CarpoolOffer from './CarpoolOffer'
import CarpoolNeed from './CarpoolNeed'

export default class MyCarpoolNeedMyCarpoolNeed extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offers: null,
      need: null
    }
  }

  componentDidMount() {
    api.getNeed()
    .then((need) => {
      this.setState({
        need
      }, () => {
        api.getLocationMatches()
        .then(({offers}) => {
          this.setState({
            offers
          })
        })
      })
    })
  }

  render() {
    return (
      <div>
        <div className="container">
          <Row>
            <Col md={4}>
              <h3>Your request</h3>
              <CarpoolNeed need={this.state.need} isOwner={true}/>
            </Col>
            <Col md={8}>
              <h3>Your matches</h3>
              <Panel>
                <Panel.Body>
                  <Grid fluid>
                  {this.state.offers && this.state.offers.length == 0 &&
                  <div>
                    <p>
                      There is no one matching your travel locations. Check back later!
                    </p>
                    <p>
                      We will try to match you with anyone travelling from the same states.
                    </p>
                  </div>
                  }
                  {this.state.offers && this.state.offers.length > 0 && this.state.offers.map((offer, i) => (
                    <Col key={i} md={3}>
                      <CarpoolOffer offer={offer} />
                    </Col>
                  ))}
                  </Grid>
                </Panel.Body>
              </Panel>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}
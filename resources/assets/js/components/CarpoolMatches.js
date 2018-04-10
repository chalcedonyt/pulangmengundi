import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Col, Grid, Panel, Row} from 'react-bootstrap'

export default class CarpoolMatches extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startLocation: props.startLocation,
      endLocation: props.endLocation,
      gender: props.gender,
      matches: null,
    }
  }

  componentDidMount() {
    api.getLocationMatches(this.state.startLocation.id, this.state.endLocation.id, this.state.gender)
    .then(({matches, partial_matches}) => {
      this.setState({
        matches: matches.concat(partial_matches)
      })
    })
  }

  render() {
    return (
      <Grid fluid>
        <Row>
          {this.state.matches && this.state.matches.map((match, i) => (
            <Col md={4} key={i}>
              <Panel>
                <Panel.Body>
                  <img src={match.user.avatar_url} />
                  {match.user.name}
                  <p>
                    Leaving from: {match.location_from.name}, {match.location_from.state}<br />
                    To: {match.location_to.name}, {match.location_to.state}<br />
                    Time: {match.leave_at}
                  </p>
                </Panel.Body>
                <Panel.Footer>
                  <Button bsStyle='success'>Contact</Button>
                </Panel.Footer>
              </Panel>
            </Col>
          ))}
        </Row>
      </Grid>
    )
  }
}
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {GoogleLoginButton, FacebookLoginButton} from 'react-social-login-buttons'
import {Alert, Grid, Col, Row, Panel} from 'react-bootstrap'
import {FormattedMessage as FM, FormattedHTMLMessage as FHM} from 'react-intl'
import Terms from './shared/Terms'

export default class TermsPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      accepted: false
    }
    this.handleAccepted = this.handleAccepted.bind(this)
  }

  handleAccepted(e)
  {
    this.setState({
      accepted: e.target.value
    })
  }

  render() {
    return (
      <Grid fluid>
        <Row>
          <Col md={6} mdOffset={3} xs={12}>
            <Panel>
              <Panel.Heading>
                <FM
                  id="login.login-to-site"
                  defaultMessage={`Login to`}
                /> <strong>carpool.pulangmengundi.com</strong>
              </Panel.Heading>
              <Panel.Body>
                <Terms />
                <p>
                  <input type='checkbox' value={1} onClick={this.handleAccepted} />&nbsp;
                  <FM
                  id="login.login-means-agree"
                  defaultMessage={
                    `I acknowledge and agree to the above. I have also read the full terms at {link}.`
                  }
                  values={{
                    'link': <strong><a target="_blank" href='https://www.pulangmengundi.com/terms.html'>pulangmengundi.com/terms.html</a></strong>
                  }}
                  />
                </p>

                <FacebookLoginButton onClick={(e) => { !this.state.accepted ? alert("Please accept the terms") : window.location = '/facebook/login'}} />
                { location.href.indexOf('localhost') !== -1 &&
                  <GoogleLoginButton onClick={(e) => { !this.state.accepted ? alert("Please accept the terms") : window.location = '/google/login'}} />
                }
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    )
  }
}
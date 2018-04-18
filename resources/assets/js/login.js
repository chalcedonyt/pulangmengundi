/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

import React from 'react'
import ReactDOM from 'react-dom'

import {GoogleLoginButton, FacebookLoginButton} from 'react-social-login-buttons'
import {Alert, Grid, Col, Row, Panel} from 'react-bootstrap'
import {IntlProvider, FormattedMessage as FM, FormattedHTMLMessage as FHM} from 'react-intl'
import {addLocaleData} from 'react-intl'
import locale_ms from 'react-intl/locale-data/ms'
import Terms from './components/shared/Terms'

addLocaleData([...locale_ms]);
import messages_bm from "./translations/bm.json"
const messages = {
  'ms': messages_bm
}
const language = window.locale || navigator.language.split(/[-_]/)[0];  // language without region code

ReactDOM.render(
  <IntlProvider locale={language} messages={messages[language]}>
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
                <FM
                id="login.login-means-agree"
                defaultMessage={
                  `I acknowledge and agree to the terms above.`
                }
                />
              </p>
              <FacebookLoginButton  onClick={(e) => { window.location = '/facebook/login'}} />
              { location.href.indexOf('localhost') !== -1 &&
                <GoogleLoginButton  onClick={(e) => { window.location = '/google/login'}} />
              }
            </Panel.Body>
          </Panel>
        </Col>
      </Row>
    </Grid>
  </IntlProvider>
, document.getElementById('login'));

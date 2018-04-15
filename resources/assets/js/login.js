/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import {GoogleLoginButton, FacebookLoginButton} from 'react-social-login-buttons';
import {Alert, Grid, Col, Row, Panel} from 'react-bootstrap'
import {IntlProvider, FormattedMessage, FormattedHTMLMessage} from 'react-intl'
import {addLocaleData} from 'react-intl';
import locale_ms from 'react-intl/locale-data/ms';

addLocaleData([...locale_ms]);
import messages_bm from "./translations/bm.json";
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
              <FormattedMessage
                id="login.login-to-site"
                defaultMessage={`Login to`}
              /> <strong>carpool.pulangmengundi.com</strong>
            </Panel.Heading>
            <Panel.Body>
              <Alert bsStyle='info'>
                <p className='lead'>
                  <FormattedMessage
                    id="login.login-1"
                    defaultMessage={`We need your social media login to determine that you are a real person.`}
                  />
                 <strong>
                  <FormattedMessage
                    id="login.login-2"
                    defaultMessage={`This helps prevent fraud and helps keep our users safe.`}
                  />
                 </strong>
                </p>
                <br /><br />
                <p className='lead'>
                  <FormattedMessage
                    id="login.login-3"
                    defaultMessage={`We will also send you email updates should a suitable driver/rider be found for you.`}
                  />
                </p>
                <br /><br />
                <p className='lead'>
                  <FormattedHTMLMessage
                    id="login.login-4"
                    defaultMessage={`You may choose to share the link to your social media account with potential carpoolers / donors so that <strong>they are empowered</strong> to verify who you are (and hopefully determine that you will be a good roadtrip companion/voter!)`}
                  />
                </p>
              </Alert>
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

/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import {GoogleLoginButton, FacebookLoginButton} from 'react-social-login-buttons';
import {Alert, Grid, Col, Row, Panel} from 'react-bootstrap'

ReactDOM.render(
    <Grid>
      <Row>
        <Col md={6} mdOffset={3} xs={8} xsOffset={2}>
          <Panel>
            <Panel.Heading>
              Login to <strong>carpool.pulangmengundi.com</strong>
            </Panel.Heading>
            <Panel.Body>
              <Alert bsStyle='default'>
                <p className='lead'>
                <strong>carpool.pulangmengundi.com</strong> needs your social media login to determine you are a real person which helps prevent fraud. <strong>This helps prevent fraud and helps keep our users safe.</strong>
                </p>
                <br /><br />
                <p className='lead'>
                  We will <strong>not</strong> store your email addresses.
                  The link to your social media account will be <strong>shared with</strong> potential carpoolers / donors so that <strong>they are empowered</strong> to verify who you are (and hopefully determine that you will be a good roadtrip companion/voter!)

                </p>
              </Alert>
              <GoogleLoginButton onClick={(e) => { window.location = '/google/login'}} />
              <FacebookLoginButton  onClick={(e) => { window.location = '/facebook/login'}} />
            </Panel.Body>
          </Panel>
        </Col>
      </Row>
    </Grid>
, document.getElementById('login'));

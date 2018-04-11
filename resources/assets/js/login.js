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
                <strong>carpool.pulangmengundi.com</strong> needs your social media login to determine you are a real person which helps prevent fraud.
                </p>
                <br /><br />
                <p className='lead'>
                  We will <strong>not</strong> store your email addresses or ask for your list of friends.
                  Your social media account will be passed to potential carpoolers so they can take the next time to make arrangements and verify who you are
                  (and whether you will be a good roadtrip companion!)
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
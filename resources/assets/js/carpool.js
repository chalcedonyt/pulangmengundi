/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

window.__BASE_API_URL = '/api';
import React from 'react';
import ReactDOM from 'react-dom';
import OfferCarpool from './components/OfferCarpool'
import NeedCarpool from './components/NeedCarpool'
import MyOffers from './components/MyOffers'
import Carpool from './components/Carpool'
import MyCarpoolNeed from './components/MyCarpoolNeed'
import {Route, BrowserRouter, Switch} from 'react-router-dom'
import {Col, Image, Navbar, Nav, NavItem} from 'react-bootstrap'

ReactDOM.render(
    <BrowserRouter>
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <Col xsHidden>
                {window.user && <img width='40' src={window.user.avatar_url} /> }
              </Col>
              <Navbar.Toggle />
              <strong>#PULANGMENGUNDI</strong>
            </Navbar.Brand>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <NavItem eventKey={1} href='/'>Carpooling</NavItem>
              <NavItem eventKey={2} href='https://subsidy.pulangmengundi.com'>Subsidies</NavItem>
            </Nav>
            {window.user &&
            <Nav pullRight>
              <NavItem eventKey={5} href='/logout'>
                Logout
              </NavItem>
              <NavItem></NavItem>
            </Nav>
            }
          </Navbar.Collapse>
        </Navbar>
        <Switch>
          <Route exact path='/' component={Carpool} />
          <Route exact path='/offer' component={OfferCarpool} />
          <Route exact path='/my-offers' component={MyOffers} />
          <Route exact path='/need' component={NeedCarpool} />
          <Route exact path='/my-need' component={MyCarpoolNeed} />
        </Switch>
      </div>
    </BrowserRouter>
, document.getElementById('carpool'));
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
import {Image, Navbar, Nav, NavItem} from 'react-bootstrap'

ReactDOM.render(
    <BrowserRouter>
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              {window.user && <img width='40' src={window.user.avatar_url} /> }

              #PulangMengundi
            </Navbar.Brand>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <NavItem eventKey={1} href='/carpool'>Carpooling</NavItem>
              <NavItem eventKey={2}>Subsidies</NavItem>
            </Nav>
            {window.user &&
            <Nav pullRight>
              <NavItem eventKey={4} href='/profile'>
                Profile
              </NavItem>
              <NavItem eventKey={5} href='/logout'>
                Logout
              </NavItem>
              <NavItem></NavItem>
            </Nav>
            }
          </Navbar.Collapse>
        </Navbar>
        <Switch>
          <Route exact path='/carpool' component={Carpool} />
          <Route exact path='/carpool/offer' component={OfferCarpool} />
          <Route exact path='/carpool/my-offers' component={MyOffers} />
          <Route exact path='/carpool/need' component={NeedCarpool} />
          <Route exact path='/carpool/my-need' component={MyCarpoolNeed} />
        </Switch>
      </div>
    </BrowserRouter>
, document.getElementById('carpool'));
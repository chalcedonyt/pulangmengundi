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
import {Route, BrowserRouter, Switch} from 'react-router-dom'
import {Navbar, Nav, NavItem} from 'react-bootstrap'

ReactDOM.render(
    <BrowserRouter>
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              #PulangMengundi
            </Navbar.Brand>
          </Navbar.Header>
          <Nav>
            <NavItem eventKey={1} href='/carpool'>Carpooling</NavItem>
            <NavItem eventKey={2}>Subsidies</NavItem>
          </Nav>
        </Navbar>
        <Switch>
          <Route exact path='/carpool' component={Carpool} />
          <Route exact path='/carpool/offer' component={OfferCarpool} />
          <Route exact path='/carpool/my-offers' component={MyOffers} />
          <Route exact path='/carpool/need' component={NeedCarpool} />
        </Switch>
      </div>
    </BrowserRouter>
, document.getElementById('carpool'));
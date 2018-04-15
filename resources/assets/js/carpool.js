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
import {Col, Glyphicon, Image, Navbar, Nav, NavItem} from 'react-bootstrap'
import {IntlProvider, FormattedMessage} from 'react-intl'
import {addLocaleData} from 'react-intl';
import locale_ms from 'react-intl/locale-data/ms';

addLocaleData([...locale_ms]);
import messages_bm from "./translations/bm.json";
const messages = {
  'ms': messages_bm
}
const language = window.locale || navigator.language.split(/[-_]/)[0];  // language without region code
ReactDOM.render(
    <BrowserRouter>
      <IntlProvider locale={language} messages={messages[language]}>
        <div>
          <Navbar fluid>
            <Navbar.Header>
              <Navbar.Brand>
                <Navbar.Toggle />
                <Col xsHidden>
                  {window.user && <Image style={{maxWidth: '40px'}} responsive src={window.user.avatar_url} /> }
                </Col>
                <a href="https://www.pulangmengundi.com">
                  {/* <Glyphicon style={{border: '1px solid black', padding: '1px'}} glyph='remove' />&nbsp; */}
                  <strong>#PULANGMENGUNDI</strong>
                </a>
              </Navbar.Brand>
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav>
                <NavItem eventKey={1} href='/ms' active={language =='ms'}>
                  BM
                </NavItem>
                <NavItem eventKey={2} href='/en' active={language =='en'}>
                  ENG
                </NavItem>
                <NavItem eventKey={3} href='/'>
                  <FormattedMessage
                    id="nav-carpool"
                    defaultMessage={`Carpooling`}
                  />
                </NavItem>
                <NavItem eventKey={4} href='https://subsidy.pulangmengundi.com'>
                  <FormattedMessage
                    id="nav-subsidy"
                    defaultMessage={`Subsidies`}
                  />
                </NavItem>
              </Nav>
              {window.user &&
              <Nav pullRight>
                <NavItem eventKey={5} href='/logout'>
                  <FormattedMessage
                    id="nav-logout"
                    defaultMessage={`Logout`}
                  />
                </NavItem>
                <NavItem></NavItem>
              </Nav>
              }
              <Nav pullRight>
                <NavItem eventKey={3} target="_blank" href='https://www.pulangmengundi.com/guidelines.html'>
                  <FormattedMessage
                    id="nav-faq"
                    defaultMessage={`Guidelines and FAQ`}
                  />
                </NavItem>
                <NavItem eventKey={4} target="_blank" href='https://www.pulangmengundi.com/about.html'>
                  <FormattedMessage
                    id="nav-about"
                    defaultMessage={`About`}
                  />
                </NavItem>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <Switch>
            <Route exact path='/:locale' component={Carpool} />
            <Route exact path='/:locale/offer' component={OfferCarpool} />
            <Route exact path='/:locale/my-offers' component={MyOffers} />
            <Route exact path='/:locale/need' component={NeedCarpool} />
            <Route exact path='/:locale/my-need' component={MyCarpoolNeed} />
          </Switch>
        </div>
      </IntlProvider>
    </BrowserRouter>
, document.getElementById('carpool'));
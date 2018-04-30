/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

import React from 'react'
import ReactDOM from 'react-dom'

import {addLocaleData} from 'react-intl'
import locale_ms from 'react-intl/locale-data/ms'
import {IntlProvider} from 'react-intl'
import {Route, BrowserRouter, Switch} from 'react-router-dom'
import TermsPage from './components/TermsPage'
import UpdateEmailAddress from './components/UpdateEmailAddress'
addLocaleData([...locale_ms]);
import messages_bm from "./translations/bm.json"
const messages = {
  'ms': messages_bm
}
const language = window.locale || navigator.language.split(/[-_]/)[0];  // language without region code

ReactDOM.render(
  <BrowserRouter>
    <IntlProvider locale={language} messages={messages[language]}>
      <Switch>
        <Route exact path='/:locale/login' component={TermsPage} />
        <Route exact path='/:locale/fill-email-address' component={UpdateEmailAddress} />
      </Switch>
    </IntlProvider>
  </BrowserRouter>
, document.getElementById('login'));

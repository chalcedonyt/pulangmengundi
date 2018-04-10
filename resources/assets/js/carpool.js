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
import {Route, BrowserRouter, Switch} from 'react-router-dom'

ReactDOM.render(
    <BrowserRouter>
      <div>
        <Switch>
          <Route exact path='/offer/carpool' component={OfferCarpool} />
          <Route exact path='/need/carpool' component={NeedCarpool} />
        </Switch>
      </div>
    </BrowserRouter>
, document.getElementById('carpool'));
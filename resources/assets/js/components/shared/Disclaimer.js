import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Alert} from 'react-bootstrap'
import {FormattedHTMLMessage as FHM} from 'react-intl'

export default class Disclaimer extends Component {
  render() {
    return (
      <Alert bsStyle='danger'>
        <p>
          <FHM
            id="request.dialog-warning"
            defaultMessage={`It is an offence to induce someone to vote for a political party. `
            + `We are a non-profit, politically neutral platform that only provides carpool-matching to connect voters - if anyone tries to induce you to vote for any party, please report this to us at pulang.undi@gmail.com or to the relevant authorities.`}
          />
        </p>
      </Alert>
    )
  }
}
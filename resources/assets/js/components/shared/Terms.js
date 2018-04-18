import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {Alert} from 'react-bootstrap'
import {IntlProvider, FormattedMessage as FM, FormattedHTMLMessage as FHM} from 'react-intl'

export default class Terms extends Component {
  render() {
    return (
      <Alert bsStyle='info' className='terms'>
        <h4>
          <FM
            id="login.login-0"
            defaultMessage={`Terms of use`}
          />
        </h4>
        <p className='lead'>
          <FM
            id="login.login-1"
            defaultMessage={`We need your social media login to determine that you are a real person.`}
          />&nbsp;
          <strong>
          <FM
            id="login.login-2"
            defaultMessage={`This helps prevent fraud and helps keep our users safe.`}
          />
          </strong>
        </p>
        <br />
        <p className='lead'>
          <FM
            id="login.login-3"
            defaultMessage={`We will also send you email updates should a suitable driver, rider, or sponsor be found for you.`}
          />
        </p>
        <br />
        <p className='lead'>
          <FHM
            id="login.login-4"
            defaultMessage={`You may choose to share the link to your social media account with potential carpoolers / donors so that <strong>they are empowered</strong> to verify who you are (and hopefully determine that you will be a good roadtrip companion/voter!)`}
          />
        </p>
        <br />
        <p>
          <FM id="tnc-1"
            defaultMessage={`It is our priority to ensure your consent in providing us with any of your personal data.`}
          />
        </p>
        <p>
          <FM id="tnc-2"
            defaultMessage={`You should also be clear on what types of personal data that we collect from you and this can either be obligatory or voluntary.`}
          />
        </p>
        <p>
          <FM id="tnc-3"
            defaultMessage={`We currently only collect your personal data as you enter it on our website.`}
          />
        </p>
        <p>
          <FM id="tnc-4"
            defaultMessage={`Your data may or may not be shared with our Strategic Partners to facilitate donation and/or carpool or mass transit initiatives.`}
          />
        </p>
        <p>
          <FM id="tnc-5"
            defaultMessage={`Pulangmengundi.com also will take all the physical, technical and organizational measures needed to ensure security and confidentiality of your personal data provided.
            If you believe that the personal data that we compiled is inaccurate, incomplete, misleading or not up-to-date, please contact us accordingly for our further action.`}
          />
        </p>
      </Alert>
    )
  }
}
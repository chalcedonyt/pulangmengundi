import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Checkbox, Col, DropdownButton, FormControl, MenuItem, Radio, Row, Panel} from 'react-bootstrap'
import DateSelection from './DateSelection'
import LocationSelection from './LocationSelection'

export default class OfferSubsidy extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startLocation: null,
      endLocation: null,
      preferredGender: null,
      carpoolQty: 2,

      willCarpoolFromPolls: true,
      willCarpoolToPolls: true,
      carpoolFromPollsDateTime: null,
      carpoolToPollsDateTime: null
    }
  }


  render() {
    return (
      <div>
        <h1>People needing subsidies</h1>

      </div>
    )
  }
}
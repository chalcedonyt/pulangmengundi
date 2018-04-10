import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {Button, Checkbox, Col, DropdownButton, FormControl, MenuItem, Radio, Row, Panel} from 'react-bootstrap'

export default class CarpoolMatches extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startLocation: props.startLocation,
      endLocation: props.endLocation,
    }
  }

  componentDidMount() {
    api.getLocationMatches(this.state.startLocation.id, this.state.endLocation.id)
    .then(({matches}) => {
      console.log(matches)
    })
  }

  render() {
    return (
      <div>
      </div>
    )
  }
}
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {DropdownButton, MenuItem, Panel} from 'react-bootstrap'

import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

export default class DateSelection extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startDate: props.date
    }
    console.log("Date is %O", props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(date) {
    this.setState({
      startDate: date
    })
  }

  render() {
    return (
      <DatePicker
        timeFormat="HH:mm"
        dateFormat="LLL"
        selected={this.state.startDate}
        minDate={moment('20180501', 'YYYYMMDD')}
        maxDate={moment('20180521', 'YYYYMMDD')}
        highlightDates={[moment('20180509', 'YYYYMMDD')]}
        onChange={this.handleChange}
        showTimeSelect />
    )
  }
}
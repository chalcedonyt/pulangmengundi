import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../../utils/api'
import {DropdownButton, MenuItem} from 'react-bootstrap'

export default class StateSelection extends Component {
  constructor(props) {
    super(props)
    this.state = {
      states: null,
      selectedState: null
    }
    this.handleStateSelect = this.handleStateSelect.bind(this)
  }
  componentWillUpdate(nextProps) {
    // console.log(nextProps)
    if (nextProps.selectedState != this.state.selectedState && nextProps.selectedState == null && this.state.selectedState !== null) {
      this.setState({
        selectedState: nextProps.selectedState
      })
    }
  }

  componentDidMount() {
    api.getStates()
    .then(({states}) => {
      this.setState({
        states
      })
    })
  }

  handleStateSelect(selectedState, callback) {
    this.setState({
      selectedState
    }, () => {
      this.props.onChange(selectedState)
    })
  }

  render() {
    const defaultTitle = this.props.title || 'State:'
    return (
      <span>
        <DropdownButton title={
          this.state.selectedState
          ? this.state.selectedState.name
          : defaultTitle
          } id="location-select">
          {this.state.states && this.state.states.map((state, i) => (
            <MenuItem
              key={i}
              onClick={(e) => this.handleStateSelect(state)}
            >{state.name}</MenuItem>
          ))}
        </DropdownButton>
      </span>
    )
  }
}
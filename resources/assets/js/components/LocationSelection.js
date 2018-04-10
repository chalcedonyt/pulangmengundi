import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import api from '../utils/api'
import {DropdownButton, MenuItem} from 'react-bootstrap'

export default class LocationSelection extends Component {
  constructor(props) {
    super(props)
    this.state = {
      states: null,
      stateLocations: null,
      selectedLocation: null,
      selectedState: null
    }

    this.handleStateSelect = this.handleStateSelect.bind(this)
    this.handleLocationSelect = this.handleLocationSelect.bind(this)

  }

  componentDidMount() {
    api.getStates()
    .then(({states}) => {
      this.setState({
        states
      })
    })
  }

  handleLocationSelect(selectedLocation) {
    this.setState({
      selectedLocation
    }, () => {
      this.props.onChange(selectedLocation)
    })
  }

  handleStateSelect(selectedState) {
    this.setState({
      selectedState,
      selectedLocation: null
    }, () => {
      this.props.onChange(null)
      api.getLocations(selectedState.name)
      .then(({locations: stateLocations}) => {
        this.setState({
          stateLocations
        })
      })
    })
  }

  render() {
    return (
      <div>
        <DropdownButton title={
          this.state.selectedState
          ? this.state.selectedState.name
          : 'State:'
          } id="location-select">
          {this.state.states && this.state.states.map((state, i) => (
            <MenuItem
              key={i}
              onClick={(e) => this.handleStateSelect(state)}
            >{state.name}</MenuItem>
          ))}
        </DropdownButton>

        {this.state.stateLocations &&
          <DropdownButton title={
            this.state.selectedLocation
            ? this.state.selectedLocation.name
            : 'District:'
            } id="location-select">
            {this.state.stateLocations.map((location, i) => (
              <MenuItem
                key={i}
                onClick={(e) => this.handleLocationSelect(location)}
              >
              {location.name}
              </MenuItem>
            ))}
          </DropdownButton>
        }
      </div>
    )
  }
}
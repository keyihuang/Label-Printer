import React, { Component } from 'react';
import axios from 'axios';

class ShowDropDown extends Component{
  constructor(props){
    super(props);

    this.handleChange = this.handleChange.bind(this)
    this.state = {
      dropDownOptions : [],
      row : this.props.row
    }
  }

  componentDidMount(){
    axios.get('/menu')
      .then(res => {
        if (res.data){
          this.setState({
            dropDownOptions : res.data.dropDownOptions
          })
        }
      }).catch(function(error){console.log(error);})
    }

  handleChange(event){
    event.preventDefault();
    var data = this.props.row
    // console.log(this.props.row);    // {'name':     ,'daydot':    }
    // console.log(event.target.value);  // new value c1
    data.daydot = event.target.value;
    // post
    axios.post('/save',data)
      .then(res => {
        if (res.data){
        this.setState({ itemToDaydot : res.data.itemToDaydot })
        }
      }).catch(function(error){console.log(error);})
  }

  render() {
    return (
      <select value = {this.props.row.daydot} onChange = {this.handleChange}>
        {this.state.dropDownOptions.map((i, idx) =>
          <option key = { idx } value = { i.value } >
          {i.value} </option>
        )}
      </select>
    )
  };
}

  export default ShowDropDown;

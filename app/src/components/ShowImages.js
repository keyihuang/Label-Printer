import React, { Component } from 'react';

class ShowImages extends Component{
  constructor(props){
    super(props);

    this.state = {

    }
  }


  render() {
    return (
      <img src = { this.props.row.img } alt = "aruco img" width = "100" height = "100"/>
    )
  };
}

  export default ShowImages;

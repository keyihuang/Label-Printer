import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import ShowDropDown from './components/ShowDropDown.js';
import ShowImages from './components/ShowImages.js';

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      items : [],
      lunch : [],
      lunchItems: [],   //[{'name'    , 'daydot'     }]
      breakfast : [],
      breakfastItems : [],
      selectedItems : [],
      selectedImages : [],
      breakfastChangedItems: [],
      lunchChangedItems: [],
      mode: 'menu',
      dropDownOptions: [],
      daydotToAruco : {},
      itemToDaydot : {},
    }

    this.printLabel = this.printLabel.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.reset = this.reset.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.showDropDown = this.showDropDown.bind(this);
    this.showImages = this.showImages.bind(this);
  }

  // events
  // 1. select breakfast/lunch
  breakfast = () => {
    this.setState({
                   items: this.state.breakfastItems,
                   mode: 'menu',
                   selectedItems:[],
                   selectedImages:[]
                 });
  }

  lunch = () => {
    this.setState({
                   items: this.state.lunchItems,
                   mode: 'menu',
                   selectedItems:[],
                   selectedImages:[]
                 });
  }

  // 2. after print the images, go back to the menu
  goBack = (event) => {
    event.preventDefault();
    this.setState({
                   mode: 'menu',
                   selectedItems:[],
                   selectedImages:[]
                 });
  }

  // 3. selected items

  handleChange = (e) => {
    this.setState({ selectedItems: e });
  }

  // 4. reset the selection
  reset(event) {
    event.preventDefault();
    this.setState({ selectedImages:[], selectedItems:[] })
  }

  // 5. settings to edit
  onEdit = () => {
    this.setState({
                   mode : 'edit',
                   selectedItems:[],
                   selectedImages:[]
                  });
  }

  showDropDown =  (cell, row) => {
    return (
      <ShowDropDown row = {row} />
    )
  }

  // 6. show the daydot images
  printLabel(event){
    event.preventDefault();
    this.setState({ mode:'show' });
    const selectedItems = { 'selected':this.state.selectedItems };
    axios.post('/print',selectedItems)
      .then(res => {
        this.setState({ selectedImages:res.data })
      })
      .then(async function(){
        var template = this.refs.divToPrint;
        var input = template.innerHTML;
        console.log(input);   // for debug, adding inline style into html string
        axios.post('/pdf',{'html':input})  //this.state.html

      }.bind(this))
  }



  showImages =  (cell, row) => {
    return (
      <ShowImages row = {row} />
    )
  }


// load the data
  componentDidMount(){
    axios.get('/menu')
      .then(res => {
        if (res.data){
          this.setState({
            items:res.data.items,
            lunch : res.data.lunch,
            lunchItems: res.data.lunchItems,   //[{'name'    , 'daydot'     }]
            breakfast : res.data.breakfast,
            breakfastItems : res.data.breakfastItems,   // ['..','..',]
            dropDownOptions: res.data.dropDownOptions,
            daydotToAruco : res.data.daydotToAruco,
            itemToDaydot : res.data.itemToDaydot,
            selectedImages : res.data.selectedImages
          })
        }
      }).catch(function(error){console.log(error);})


  }


  render(){
    const navbar = (
      <nav ref = "nav" className = "navbar">
        <div className = "navbar-nav">
          {/*
          <a role = "button" onClick = { this.breakfast }>Breakfast</a>
          <a role = "button" onClick = { this.breakfast }>Lunch</a>
          <a role = "button" onClick = { this.breakfast }>
            <span className = "glyphicon glyphicon-cog"></span>
          </a>
                    */}

          <input type = 'button' onClick = { this.breakfast } value = "Breakfast" />
          <input type = 'button' onClick = { this.lunch } value = "Lunch" />
          <input type = 'button' onClick = { this.onEdit } value = "Settings" />




        </div>
      </nav>
    );

    const footer = (
      <footer className = 'bottom'>
      <div>
        <button className = 'footerBtn' onClick = { this.reset }>
          <span className = "glyphicon glyphicon-remove"></span> Reset
        </button>
        <button className = 'footerBtn' onClick = { this.printLabel }>
          <span className = "glyphicon glyphicon-print"></span> Print Label
        </button>
      </div>
      </footer>
    );

    if (this.state.mode === 'menu'){
      return(
        <div>
          {navbar}
          <div className = "row">
            <ToggleButtonGroup
              type = "checkbox"
              value = { this.state.selectedItems }
              onChange = { this.handleChange }
            >

            {this.state.items.map((i,idx) =>
              <ToggleButton className = "col-xs-6 list-group-item list-group-item-action"
                key = {idx}
                value = {i}>
                <div className = "menuText">
                  <div className = "numberCircle">{idx+1}</div>
                  <div className = "newLine"> {i} </div>
                </div>
              </ToggleButton>)}
           </ToggleButtonGroup>
          </div>
          {footer}
        </div>
      )}

    else if (this.state.mode === 'edit'){
      return(
        <div>
          { navbar }
          <div className = 'container'>
            <b><big>Breakfast:</big></b>
            <BootstrapTable data={ this.state.breakfast } bordered = { false }>
              <TableHeaderColumn width="70%" dataField='name' isKey />
              <TableHeaderColumn dataField='daydot' dataFormat = { this.showDropDown } />
            </BootstrapTable>

            <br></br>

            <b><big>Lunch:</big></b>
            <BootstrapTable data={ this.state.lunch } bordered = { false }>
              <TableHeaderColumn width="70%" dataField='name' isKey />
              <TableHeaderColumn dataField='daydot' dataFormat = { this.showDropDown } />
            </BootstrapTable>

          </div>

        </div>

    )}

    else {
      return(
        <div>
          { navbar }
          <div ref = "divToPrint" className = 'container'>
            <BootstrapTable className = "center" data={ this.state.selectedImages }
              bordered = { false }>
              <TableHeaderColumn width = "30%" dataField='img' dataFormat = { this.showImages }/>
              <TableHeaderColumn width = "30%" dataField='item' isKey />
              <TableHeaderColumn width = "30%" dataField='daydot'  />
            </BootstrapTable>
          </div>

          <footer className = 'bottom'>
            <form action = '/menu'>
              <button className = 'btn-block' type = 'submit'
                onClick = { this.goBack }>
                <span className = "glyphicon glyphicon-step-backward"></span> Back
              </button>
            </form>
          </footer>
        </div>
      );

    }


  }
}

export default App;

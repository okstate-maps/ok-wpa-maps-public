import React, { Component } from 'react';
import { WebMapView } from './WebMapView';
import { loadModules } from 'esri-loader';
import "@esri/calcite-components";
import './App.css';

class App extends Component {

  constructor(props){
    super(props);
    this.state = {'welcomeScreen' : true}
  }
  render() {

    return (
      <div className="App">

        {this.state.welcomeScreen &&
          <>
            <h1>Choose your path:</h1>

            <button onClick={() => this.setState({welcomeScreen: false, workflow: 'create'})}>
                <calcite-icon scale='l' class="big-icon" icon="addInNew"></calcite-icon> 
                <br/>Draw some shapes
            </button>
            <h2>or</h2>
            <button onClick={() => this.setState({welcomeScreen: false, workflow: 'update'})}>
                <calcite-icon scale='l' class="big-icon" icon="editAttributes"></calcite-icon> 
                <br/>Review existing shapes
            </button>
          </>
        }
        
        {!this.state.welcomeScreen &&
          <WebMapView workflow={this.state.workflow}/>
        }
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import { WebMapView } from './WebMapView';
import { loadModules } from 'esri-loader';
import "@esri/calcite-components";
import './App.css';

class App extends Component {

  constructor(props){
    super(props);
    this.state = {'welcomeScreen' : true,
                  'credentials': false}
  }


  componentDidUpdate(prevProps, prevState, snapshot){
    console.log("componentDidUpdate:")
    console.log(prevState);
    console.log(this.state);
  }


   componentDidMount() {
    var that = this;
    // lazy load the required ArcGIS API for JavaScript modules and CSS
    loadModules(["esri/identity/OAuthInfo","esri/identity/IdentityManager",], { css: true })
    .then(([OAuthInfo, esriId]) => {
      var info = new OAuthInfo({
          // Swap this ID out with registered application ID
          appId: "l3OWRmRCGfkAN4Dh",
          // Uncomment the next line and update if using your own portal
          portalUrl: "http://osu-geog.maps.arcgis.com/",
          // Uncomment the next line to prevent the user's signed in state from being shared with other apps on the same domain with the same authNamespace value.
          // authNamespace: "portal_oauth_inline",
          popup: false
      });

      esriId.registerOAuthInfos([info]);

      esriId
        .checkSignInStatus(info.portalUrl + "/sharing")
        .then((creds) => {
          console.log(creds);
          that.setState({'credentials': creds});
        })
        .catch(esriId.getCredential(info.portalUrl + "/sharing"));
   });

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

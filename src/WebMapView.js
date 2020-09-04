import React from 'react';
import { loadModules } from 'esri-loader';

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


export class WebMapView extends React.Component {
  constructor(props) {
    super(props);
    this.WPATilesUrl = 'https://tiles.arcgis.com/tiles/jWQlP64OuwDh6GGX/arcgis/rest/services/_wpa_all_6Aug2020/MapServer';
    this.WPAMapsLandParcelsUrl = 'https://services1.arcgis.com/jWQlP64OuwDh6GGX/arcgis/rest/services/WPA_Maps_Land_Parcels/FeatureServer/0';
    this.sectionsLayerUrl = 'https://services1.arcgis.com/jWQlP64OuwDh6GGX/ArcGIS/rest/services/Oklahoma_Public_Land_Survey_Sections/FeatureServer/0';
    this.mapRef = React.createRef();
    this.workflow = props.workflow;
    this.editThis = this.editThis.bind(this);
    this.sayThanks = this.sayThanks.bind(this);
  }


  componentDidMount() {
    // lazy load the required ArcGIS API for JavaScript modules and CSS
    loadModules(['esri/Map', 'esri/Basemap', 'esri/views/MapView', 
                 'esri/layers/FeatureLayer','esri/widgets/Feature','esri/layers/TileLayer',
                 'esri/widgets/Editor', 'esri/core/watchUtils',
                 'esri/widgets/AreaMeasurement2D'], { css: true })
    .then(([ArcGISMap, Basemap, MapView, FeatureLayer, Feature, TileLayer, Editor, watchUtils, AreaMeasurement2D]) => {

      const WPATiles = new TileLayer({
        url: this.WPATilesUrl
      })
      //this.map.add(WPATiles);


      this.map = new ArcGISMap({
        basemap: new Basemap({baseLayers:[WPATiles]})
      });



      this.view = new MapView({
        container: this.mapRef.current,
        map: this.map,
        highlightOptions: {
          color: '#fe5c00',
          fillOpacity: 0.1
        },
        popup: {
          dockEnabled: true,
          dockOptions: {
            // Disables the dock button from the popup
            buttonEnabled: false,
            // Ignore the default sizes that trigger responsive docking
            breakpoint: false
          }
        },
        center: [-98.5, 35.5],
        zoom: 8
      });
    

      //measurement widget, but let's not use it for now
      /*
      this.measurement = new AreaMeasurement2D({
        view: this.view,
        activeTool: 'area',
        unit: 'acres'
      });

      this.view.ui.add(this.measurement, 'bottom-left');
      */


      const editThisAction = {
          title: 'Edit feature',
          id: 'edit-this',
          className: 'esri-icon-edit'
        };

      const thisLooksOkAction = {
          title: 'Looks good!',
          id: 'this-looks-ok',
          className: 'esri-icon-check-mark'
        };

      const template = {
        title: 'Please doublecheck the info below.',
        content: [
          {
            type: 'fields',
            fieldInfos: [
              {
                fieldName: 'OwnerLastName',
                label: 'Owner\'s Last Name (if an individual)'
              },

              {
                fieldName: 'OwnerFirstNameAndMI',
                label: 'Owner\'s First Name or initials (if an individual)'
              },   
              {
                fieldName: 'OwnerOrgName',
                label: 'Owner (if an entity or organization)'
              },
              {
                fieldName: 'LandValue',
                label: 'Land Value'
              },
              {
                fieldName: 'ImprovementsValue2',
                label: 'Improvements Value'
              },
            ]
          }
        ],
        overwriteActions: true,
        actions: [thisLooksOkAction, editThisAction]
      }

      
      const WPAMapsLandParcels = new FeatureLayer({
        url: this.WPAMapsLandParcelsUrl,
        popupTemplate: template
      });
      
      this.editor = new Editor({
          view: this.view,
          allowedWorkflows: [this.workflow],
          layerInfos: [{
            view: this.view,
            layer: WPAMapsLandParcels,
            fieldConfig: [
              {
                name: 'OwnerLastName',
                label: 'Owner\'s Last Name (if an individual)'
              },

              {
                name: 'OwnerFirstNameAndMI',
                label: 'Owner\'s First Name or initials (if an individual)'
              },   
              {
                name: 'OwnerOrgName',
                label: 'Owner (if an entity or organization)'
              },
              {
                name: 'LandValue',
                label: 'Land Value'
              },
              {
                name: 'ImprovementsValue2',
                label: 'Improvements Value'
              }
            ],
            allowAttachments: false,
            deleteEnabled: false
          }]
        });

      this.editor.postInitialize = function(){
        // I can't believe this is the only way to override widget labelling, but here we are
        watchUtils.init(this,'messages', (messages)=>{
          messages.widgetLabel = 'WPA Maps';
          messages.addFeature = 'Draw a new shape';
          messages.editFeature = 'Review an existing record';
        });
      };




      // Event handler that fires each time an action is clicked
      var that = this;
      this.view.popup.on("trigger-action", function (event) {

            if (event.action.id === "edit-this") {
              that.editThis();
            }

            if (event.action.id === 'this-looks-ok'){
              that.sayThanks();
            }

          });


     


      // for creation, pick a random PLSS Section and zoom to it
      if (this.workflow === 'create') {
          var randomSectionId = getRandomInt(70915);
          const sectionsLayer = new FeatureLayer({
            url: this.sectionsLayerUrl,
            definitionExpression: 'OBJECTID = ' + randomSectionId
          });

          sectionsLayer
            .when(() => {
              return sectionsLayer.queryExtent();
            })
            .then((response) => {
              this.view.goTo(response.extent);
            })
          this.map.add(sectionsLayer);
          this.view.ui.add(this.editor, 'top-right');
          //this.editor.startCreateWorkflowAtFeatureCreation({layer: WPAMapsLandParcels, template: template});
      }


      var randomId;
      // for reviewing, pick a random polygon and zoom to it
      if (this.workflow === 'update') {
          WPAMapsLandParcels.queryObjectIds().then((objectIds)=>{
            randomId = getRandomInt(objectIds.length - 1);
            WPAMapsLandParcels.definitionExpression = "OBJECTID = " + objectIds[randomId];

          WPAMapsLandParcels
            .when(() => {
              return WPAMapsLandParcels.queryFeatures();
            })
            .then((response) => {
              this.view.goTo(response.features[0].geometry.extent);
             // this.editor.startUpdateWorkflowAtFeatureEdit(response.features[0]);

            })
          });

      }

      this.map.add(WPAMapsLandParcels);

      //this.view.ui.add(this.editor, 'top-right');
      });
  }
  sayThanks() {
    alert("thank you");
    //TODO add an incrementing integer for 'numberOfTimesChecked' or something along those lines.
    this.view.popup.close();
  }
  editThis() {
        var view = this.view;
        var editor = this.editor; 
        view.when(function () {

  

            // If the EditorViewModel's activeWorkflow is null, make the popup not visible
            if (!editor.viewModel.activeWorkFlow) {
              view.popup.visible = false;
              // Call the Editor update feature edit workflow

              editor.startUpdateWorkflowAtFeatureEdit(
                view.popup.selectedFeature
              );
              view.ui.add(editor, "top-right");
              view.popup.spinnerEnabled = false;
            }

            // We need to set a timeout to ensure the editor widget is fully rendered. We
            // then grab it from the DOM stack
            setTimeout(function () {
              // Use the editor's back button as a way to cancel out of editing
              let arrComp = editor.domNode.getElementsByClassName(
                "esri-editor__back-button esri-interactive"
              );
              if (arrComp.length === 1) {
                // Add a tooltip for the back button
                arrComp[0].setAttribute(
                  "title",
                  "Cancel edits, return to popup"
                );
                // Add a listerner to listen for when the editor's back button is clicked
                arrComp[0].addEventListener("click", function (evt) {
                  // Prevent the default behavior for the back button and instead remove the editor and reopen the popup
                  evt.preventDefault();
                  view.ui.remove(editor);
                  // view.popup.open({
                  //   features: features
                  // });
                });
              }
            }, 150);
        
          
        });
      }

  componentWillUnmount() {
    if (this.view) {
      // destroy the map view
      this.view.container = null;
    }
  }

  render() {
    return (
      <>
        <div className="webmap" ref={this.mapRef} />
      </>
    );
  }
}
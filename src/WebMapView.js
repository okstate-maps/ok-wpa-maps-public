import React from 'react';
import { loadModules } from 'esri-loader';

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

export class WebMapView extends React.Component {
  constructor(props) {
    super(props);
    this.WPATilesUrl = 'https://tiles.arcgis.com/tiles/jWQlP64OuwDh6GGX/arcgis/rest/services/_wpa_all_6Aug2020/MapServer';
    this.WPAMapsLandParcelsUrl = 'https://services1.arcgis.com/jWQlP64OuwDh6GGX/arcgis/rest/services/WPA_Maps_Land_Parcels_Public/FeatureServer/0';
    this.sectionsLayerUrl = 'https://services1.arcgis.com/jWQlP64OuwDh6GGX/ArcGIS/rest/services/Oklahoma_Public_Land_Survey_Sections/FeatureServer/0';
    this.mapRef = React.createRef();
    this.workflow = props.workflow;
    this.editThis = this.editThis.bind(this);
    this.sayThanks = this.sayThanks.bind(this);
    this.reviewWorkflow = this.reviewWorkflow.bind(this);
    this.getRandomParcel = this.getRandomParcel.bind(this);
    this.getRandomSection = this.getRandomSection.bind(this);
    this.rotationChange = this.rotationChange.bind(this);
    this.updateTimesChecked = this.updateTimesChecked.bind(this);
    this.state = {
                  updateFeature: null,
                  mapRotation: 0
                };
    }

  getRandomParcel() {
    var that = this;
    var randomId = getRandomInt(this.objectIds.length - 1);     
    var q = this.WPAMapsLandParcels.createQuery();
    q.where = 'OBJECTID = ' + this.objectIds[randomId];
    //this.WPAMapsLandParcels.definitionExpression = 'OBJECTID = ' + this.objectIds[randomId];
    this.WPAMapsLandParcels.queryFeatures(q).then((response) => {
      that.view.goTo(response.features[0].geometry.extent);
      that.view.popup.features = response.features;
      that.view.popup.visible = true;
      that.setState({updateFeature: response.features[0]});
      this.view.whenLayerView(this.WPAMapsLandParcels).then(function(layerView){
        that.highlightedFeature = layerView.highlight(response.features[0]);
      });
    });

  }

  getRandomSection() {

    var randomSectionId = getRandomInt(70915);
    this.sectionsLayer.definitionExpression = 'OBJECTID = ' + randomSectionId;
          
    this.sectionsLayer
      .when(() => {
        return this.sectionsLayer.queryExtent();
      })
      .then((response) => {
        this.view.goTo(response.extent);
    })
  }

  reviewWorkflow() {
    var that = this;    
    this.WPAMapsLandParcels.queryObjectIds().then((objectIds) => {
      that.objectIds = objectIds;
      that.getRandomParcel();
    });
  }

  rotationChange(newRot, oldRot, propName) {
    if (oldRot === 0 && newRot !== 0) {
      this.view.ui.add(this.compass, 'top-left');
    }

    if (oldRot !== 0 && newRot === 0) {
      this.view.ui.remove(this.compass);
    }
  }
  
  componentDidMount() {
    // lazy load the required ArcGIS API for JavaScript modules and CSS
    loadModules(['esri/Map', 'esri/Basemap', 
                 'esri/views/MapView', 
                 'esri/layers/FeatureLayer',
                 'esri/views/layers/FeatureLayerView',
                 'esri/layers/TileLayer',
                 'esri/widgets/Compass',
                 'esri/widgets/Editor',
                 'esri/core/watchUtils',
                 'esri/widgets/AreaMeasurement2D'], { css: true })
    .then(([ArcGISMap, Basemap, MapView, FeatureLayer, 
            FeatureLayerView, TileLayer, Compass, Editor, 
            watchUtils, AreaMeasurement2D]) => {

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
        }
        //center: [-98.5, 35.5],
        //zoom: 8
      });
    
      this.compass = new Compass({
        view: this.view
      });
      
      this.view.watch('rotation', this.rotationChange);

      var refreshButton = document.createElement('div');

      refreshButton.className = 'esri-icon-refresh esri-widget--button esri-widget esri-interactive ';
      refreshButton.title = this.workflow === 'create' ? 
            'Go to another random section.' : 
            'Get another entry to review.';
      refreshButton.addEventListener('click', () => {
        switch (this.workflow) {
          case 'create': 
            this.getRandomSection();
            break;
          case 'update':
            this.getRandomParcel();
            break;
          default:
            alert('moo');
        }
      });

      this.view.ui.add(refreshButton, 'bottom-left');

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
              {
                fieldName: 'TaxExempt',
                label: 'Marked with an X?'
              }
            ]
          }
        ],
        //overwriteActions: true,
        actions: [thisLooksOkAction, editThisAction]
      }

      const formTemplate = {
        title: 'Land Info',
        elements: [{ // Autocasts to new GroupElement
          type: 'group',
          label: 'Owner Information',
          elements: [
              {
                type: 'field',
                fieldName: 'OwnerLastName',
                label: 'Owner\'s Last Name (if an individual)'
              },

              {
                type: 'field',
                fieldName: 'OwnerFirstNameAndMI',
                label: 'Owner\'s First Name or initials (if an individual)'
              },   
              {
                type: 'field',
                fieldName: 'OwnerOrgName',
                label: 'Owner (if an entity or organization)'
              }
              
           
          ]
        },

        { // Autocasts to new GroupElement
          type: 'group',
          label: 'Land and Improvement Valuation',
          elements: [
             {
                type: 'field',
                fieldName: 'LandValue',
                label: 'Land Value'
              },
              {
                type: 'field',
                fieldName: 'ImprovementsValue2',
                label: 'Improvements Value'
              },
          ]
        },

           {
                type: 'field',
                fieldName: 'TaxExempt',
                label: 'Marked with an X?'
              }

        ]
      }

      this.WPAMapsLandParcels = new FeatureLayer({
        url: this.WPAMapsLandParcelsUrl,
        popupTemplate: template,
        formTemplate: formTemplate,
        groupDisplay: 'sequential'
      });

      
      this.WPAMapsLandParcels.on('edits', (e) => {
        if (e.updatedFeatures.length > 0) {
          this.sayThanks();
          this.view.ui.remove(this.editor);
        }
      } );

      this.editor = new Editor({
          view: this.view,
          allowedWorkflows: [this.workflow],
          supportingWidgetDefaults: {
            featureForm: {
              groupDisplay: 'sequential',
              fieldConfig: [
              {
                name: 'OwnerLastName',
                label: 'Owner\'s Last Name (if an individual)',
                required: false
              },

              {
                name: 'OwnerFirstNameAndMI',
                label: 'Owner\'s First Name or initials (if an individual)',
                required: false
              },   
              {
                name: 'OwnerOrgName',
                label: 'Owner (if an entity or organization)',
                required: false
              },
              {
                name: 'LandValue',
                label: 'Land Value',
                required: false
              },
              {
                name: 'ImprovementsValue2',
                label: 'Improvements Value',
                required: false
              },
             {
                name: 'TaxExempt',
                label: 'Marked with an X?',
                required: false
              }
            ],
            }
          },
          layerInfos: [{
            view: this.view,
            layer: this.WPAMapsLandParcels,
            //fieldConfig: 
            allowAttachments: false,
            deleteEnabled: false
          }]
        });


      // I can't believe this is the only way to override widget labelling, but here we are
      this.editor.postInitialize = function(){
        watchUtils.init(this,'messages', (messages) => {
          messages.widgetLabel = 'WPA Maps';
          messages.addFeature = 'Draw a new shape';
          messages.editFeature = 'Review an existing record';
        });
      };

      //an attempt to prevent identical features from being created due to lack of feedback
      //from the editor widget
      this.editor.viewModel.watch('syncing', function(newVal,oldVal, propName, target){
        let editButton = document.getElementsByClassName('esri-editor__control-button');
        if (editButton.length === 0){
          return;
        }
        
        if (newVal === true) {
          
          editButton[0].disabled = 'disabled';
          editButton[0].classList.add('esri-button--disabled');
        }
          
        if (newVal === false) {

          editButton[0].removeAttribute('disabled');
          editButton[0].classList.remove('esri-button--disabled');
        }
      })

      // Event handler that fires each time an action is clicked
      var that = this;
      this.view.popup.on('trigger-action', function (event) {
            if (event.action.id === 'edit-this') {
              that.editThis();
            }

            if (event.action.id === 'this-looks-ok'){
              that.updateTimesChecked();
            }

          });   

      // for creation, pick a random PLSS Section and zoom to it
      if (this.workflow === 'create') {
          
          this.sectionsLayer = new FeatureLayer({
            url: this.sectionsLayerUrl
          });

          this.getRandomSection();
          this.map.add(this.sectionsLayer);
          this.WPAMapsLandParcels.popupEnabled = false;
          this.view.ui.add(this.editor, 'bottom-right');
          //this.editor.startCreateWorkflowAtFeatureCreation({layer: WPAMapsLandParcels, template: template});
      }

      // for reviewing, pick a random polygon and zoom to it
      if (this.workflow === 'update') {
        this.reviewWorkflow();
      }

      this.map.add(this.WPAMapsLandParcels);

      //this.view.ui.add(this.editor, 'top-right');
      });
  }

  updateTimesChecked() {
    var upFeat = this.state.updateFeature;
    var currentTimesChecked = upFeat.getAttribute('timesChecked');
    upFeat.setAttribute('timesChecked', currentTimesChecked + 1);
    var edits = {updateFeatures: [upFeat]};
    this.WPAMapsLandParcels.applyEdits(edits);
    this.highlightedFeature.remove();
  }

  sayThanks() {
    var that = this;

    this.props.setModalContent(
      <div>
        <h1>Thank you!</h1>
        <p>Here's another entry to check.</p>
      </div>
    );
    this.props.openModal();
    setTimeout(function(){
      that.props.closeModal(); 
      }, 2000);

    this.highlightedFeature.remove();
    this.getRandomParcel();
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
              view.ui.add(editor, 'bottom-right');
              view.popup.spinnerEnabled = false;
            }

            // We need to set a timeout to ensure the editor widget is fully rendered. We
            // then grab it from the DOM stack
            setTimeout(function () {
              // Use the editor's back button as a way to cancel out of editing
              let arrComp = editor.domNode.getElementsByClassName(
                'esri-editor__back-button esri-interactive'
              );
              if (arrComp.length === 1) {
                // Add a tooltip for the back button
                arrComp[0].setAttribute(
                  'title',
                  'Cancel edits, return to popup'
                );
                // Add a listerner to listen for when the editor's back button is clicked
                arrComp[0].addEventListener('click', function (evt) {
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
        <div className='webmap' ref={this.mapRef} />
      </>
    );
  }
}
import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, StoreHelpers } from 'react-joyride';

export function IntroJoyride(props) {
	const [steps, setSteps] = useState([
    {
      content: 
          <div>
            <h1>Draw and transcribe map data</h1>
            <div className='imgContainer'>
              <img alt='Draw a shape representing a 
                    parcel of land and transcribe the ' 
                  src={process.env.PUBLIC_URL + '/img/wpa3.gif'}/>
            </div>
          </div>,
      placement: 'auto',
      target: '.drawShapes',
      disableBeacon: true
    },    
    // {
    //   content: 
    //       <div>
    //         <h1>Draw and transcribe map data</h1>
    //         <div>
              
    //         </div>
    //       </div>,
    //   placement: 'auto',
    //   target: '.drawShapes',
    //   disableBeacon: false
    // },

    {
      content: 
      <div>
        <h1>Review existing entries</h1>
        <h3>If you don't see any errors, click <strong><calcite-icon scale='s' icon="check"></calcite-icon>Looks Good!</strong></h3>
        <div className='imgContainer'>
          <img alt='Reviewing parcels' 
               src={process.env.PUBLIC_URL + '/img/wpa7.gif'}/>
        </div>
      </div>,
      placement: 'auto',
      target: '.reviewShapes'    
    },
    {
      content: 
      <div>
        <h1>Review existing entries</h1>
        <h3>If you see something incorrect or missing, click <strong><calcite-icon scale='s' icon="pencil"></calcite-icon>Edit feature</strong></h3>
        <div className='imgContainer'>
          <img alt='Reviewing parcels' 
               src={process.env.PUBLIC_URL + '/img/wpa8.gif'}/>
        </div>
      </div>,
      placement: 'auto',
      target: '.reviewShapes'    
    },
    {
      content: 
      <>
        <h3>Right click and drag to change the rotation of the map.</h3>
        <div className='imgContainer'>
          <img alt='Demonstration of rotating the map' 
               src={process.env.PUBLIC_URL + '/img/wpa4.gif'}/>
        </div>
        <p> Press the compass button to reset</p>
      </>,
      placement: 'center',
      target: 'body'
    }
    
  ]);

  function handleJoyrideCallback(data) {
    const { status, type } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      props.toggleIntro(false);
    }
  }

  return (
   <Joyride
          callback={handleJoyrideCallback}
          continuous={true}
          run={props.runIntro}
          scrollToFirstStep={true}
          showProgress={true}
          showSkipButton={true}
          steps={steps}
          styles={{
            options: {
              zIndex: 10000,
              width: 800
            },
          }}
        />
  )
}

export default IntroJoyride;
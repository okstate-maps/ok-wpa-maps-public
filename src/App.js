import React, { useState } from 'react';
import Modal from 'react-modal';
import { IntroJoyride } from './IntroJoyride';
import { WebMapView } from './WebMapView';
import "@esri/calcite-components";
import './App.css';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

function App() {
  const [welcomeScreen, toggleWelcomeScreen] = useState(true);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [workflow, setWorkflow] = useState(0);
  const [modalContent, setModalContent] = useState('');
  const [runIntro, toggleIntro] = useState(false);
  

  Modal.setAppElement('#root');

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    //subtitle.style.color = '#f00';
  }

  function closeModal(){
    setIsOpen(false);
  }
  
    return (
      <div className="App">
        <IntroJoyride
          runIntro={runIntro}
          toggleIntro={toggleIntro}
        />
        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          {modalContent}
        </Modal>

        {welcomeScreen === true &&
          <>
            <h1>Choose your path:</h1>
            
            <button className='drawShapes' onClick={() => {toggleWelcomeScreen(false); setWorkflow('create')}}>
                <calcite-icon scale='l' class="big-icon" icon="addInNew"></calcite-icon> 
                <br/>Draw some shapes
            </button>
            <h2>or</h2>
            <button className='reviewShapes' onClick={() => {toggleWelcomeScreen(false); setWorkflow('update')}}>
                <calcite-icon scale='l' class="big-icon" icon="editAttributes"></calcite-icon> 
                <br/>Review existing shapes
            </button>
            <h2>or</h2>
            <button onClick={() => {toggleIntro(!runIntro)}}>
                <calcite-icon scale='l' class="big-icon" icon="question"></calcite-icon> 
                <br/>View the intro
            </button>
          </>
        }
        
        {welcomeScreen === false &&
          <WebMapView 
            workflow={workflow} 
            openModal={openModal}
            closeModal={closeModal}
            setModalContent={setModalContent}/>
        }
      </div>
    );
  }

export default App;
import React, { useState } from 'react'
import { 
  Modal,
  Fade,
  Backdrop
 } from '@material-ui/core'

const ModalOverlay = () => {
  
  const [modalOpen, setModalOpen] = useState(false)  
  
  const modalOpenHandler = () => {
    setModalOpen(true)
  }
  
  const modalCloseHandler = () => {
    setModalOpen(false)
  }
  
  return (
    <>
      <button onClick={ modalOpenHandler }>
        open modal
      </button>
      <Modal
        open={ modalOpen }
        onClose={ modalCloseHandler }
        closeAfterTransition
        BackdropComponent={ Backdrop }
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={ modalOpen }>
          <div>
            <p>hello?</p>
          </div>
        </Fade>
      </Modal>
    </>
  )
}

export default ModalOverlay

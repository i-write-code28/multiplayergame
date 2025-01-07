import React from 'react'
import './css/side-options.css'
import Viewers from './Viewers'
import EmojiPicker from './utils/EmojiPicker'
function SideOptions() {
  return (
    <div className='side-options'>
      <Viewers/>
      <EmojiPicker/>
      </div>
  )
}

export default SideOptions
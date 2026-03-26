import React from 'react'
import '../styles/import-review-page.css'
import { CheckIcon } from '../static/Icons'

const CustomCheckbox = ({selected, onChange}) => {
  return (
    <div className={`custom-checkbox ${selected ? 'selected' : ''}`} onClick={onChange}>
      {selected && (
        <div className='review-icon-container' style={{fontSize: '16px', color: 'white'}}>
          <CheckIcon />
        </div>
      )}
    </div>
  )
}

export default CustomCheckbox
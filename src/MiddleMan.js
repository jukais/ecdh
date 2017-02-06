import './MiddleMan.css'
import React from 'react'
import { arrayToText } from './cryptoUtils'

const MiddleMan = ({ message, ...rest }) => {
  return (
    <div className='MiddleMan' >
      <h3>Mikke</h3>
      {
        message
          ? (
            <div>
              <strong>{message.user}:</strong>
              <pre>
                {`iv: ${message.data.iv}\nmessage: ${arrayToText(message.data.encrypted)}`}
              </pre>
            </div>
          ) : ''
      }
      <pre>
        {JSON.stringify(rest, null, ' ')}
      </pre>
    </div>
  )
}

MiddleMan.propTypes = {
  message: React.PropTypes.object
}

export default MiddleMan

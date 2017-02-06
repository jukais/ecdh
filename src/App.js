import './App.css'
import React, { Component } from 'react'
import User from './User'
import MiddleMan from './MiddleMan'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      publicKeys: {}
    }
  }

  sendMessage = (message) => {
    this.setState({ message })
  }

  sendPublicKey = (key) => {
    let { publicKeys } = this.state
    publicKeys[ key.name ] = key.key
    this.setState({ publicKeys })
  }

  render () {
    return (
      <div className='App' >
        <div className='App-header' >
          <h2>Emoticon Command Debug Hacker</h2>
        </div>
        <div className='App-intro' >
          <User
            name='Rane'
            message={this.state.message}
            publicKey={this.state.publicKeys[ 'Keijo' ]}
            sendPublicKey={this.sendPublicKey}
            sendMessage={this.sendMessage}
          />
          <MiddleMan {...this.state} />
          <User
            name='Keijo'
            message={this.state.message}
            publicKey={this.state.publicKeys[ 'Rane' ]}
            sendPublicKey={this.sendPublicKey}
            sendMessage={this.sendMessage}
          />
        </div>
      </div>
    )
  }
}

export default App

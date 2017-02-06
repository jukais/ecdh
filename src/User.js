import './User.css'
import React, { Component } from 'react'
import { createKeys, decrypt, deriveKey, encrypt, exportKey, importKey } from './cryptoUtils'

const textToArray = (text) => new TextEncoder('utf-8').encode(text)

class User extends Component {

  constructor (props) {
    super(props)
    this.state = {
      keys: {},
      symmetricKey: null,
      messages: [],
      textArea: ''
    }
  }

  componentDidMount () {
    createKeys()
      .then((keys) => {
        this.setState({ keys })
        return exportKey(keys.publicKey)
      })
      .then((exportedKey) => {
        this.props.sendPublicKey({
          name: this.props.name,
          key: exportedKey
        })
      })
  }

  componentWillReceiveProps (np) {
    if (np.publicKey && this.state.keys.privateKey) {
      importKey(np.publicKey)
        .then(publicKey => deriveKey(this.state.keys.privateKey, publicKey))
        .then(symmetricKey => {
          this.setState(symmetricKey)
        })
    }

    if (this.prevMessage !== np.message) {
      this.prevMessage = np.message

      decrypt(this.state.symmetricKey, np.message.data)
        .then(decrypted => {
          this.setState((prevState) => ({
            messages: prevState.messages.concat([ decrypted ])
          }))
        })
    }
  }

  sendMessage = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target.value.trim()) {
      encrypt(this.state.symmetricKey, textToArray(this.state.textArea.trim()))
        .then(data =>
          this.props.sendMessage({ user: this.props.name, data })
        )
      this.setState({ textArea: '' })
    }
  }

  handleChange = (e) => {
    if (e.target.value.trim()) {
      this.setState({ textArea: e.target.value })
    }
  }

  message = (message, index) => {
    return (
      <li key={index} >
        <pre>{`${message}`}</pre>
      </li>
    )
  }

  newKey = () => {
    createKeys()
      .then((keys) => {
        this.setState({ keys })
        return keys
      })
      .then(({ publicKey }) => {
        return exportKey(publicKey)
      })
      .then((exportedKey) => {
        this.props.sendPublicKey({
          name: this.props.name,
          key: exportedKey
        })
      })
  }

  render () {
    return (
      <div className='User' >
        <h3>{this.props.name}</h3>
        <pre >
          own privateKey: {JSON.stringify(!!this.state.keys.privateKey)}<br />
          own publicKey: {JSON.stringify(!!this.state.keys.publicKey)}<br />
          other publicKey: {JSON.stringify(!!this.props.publicKey)}<br />
          symmetricKey: {JSON.stringify(!!this.state.symmetricKey)}<br />
        </pre>
        <ul>
          { this.state.messages.map(this.message) }
        </ul>
        <textarea
          rows='5'
          type='text'
          placeholder='write something'
          value={this.state.textArea}
          onChange={this.handleChange}
          disabled={!this.state.symmetricKey}
          onKeyPress={this.sendMessage} />
        <br />
        <button
          disabled={!this.state.symmetricKey}
          onClick={this.newKey} >
          Create new key
        </button>
      </div>
    )
  }
}

User.propTypes = {
  name: React.PropTypes.string.isRequired,
  publicKey: React.PropTypes.object,
  sendPublicKey: React.PropTypes.func.isRequired,
  sendMessage: React.PropTypes.func.isRequired
}

export default User

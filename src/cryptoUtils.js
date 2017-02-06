const algorithm = 'ECDH'
const symmetric = 'AES-GCM'
const length = 256
const tagLength = 128
// const bits = 256
const namedCurve = 'P-256'
const keyFormat = 'jwk'
const crypto = global.crypto


const createKeys = () => {
  return crypto.subtle.generateKey(
    {
      name: algorithm,
      namedCurve
    },
    true, // whether the key is extractable (i.e. can be used in exportKey)
    [ 'deriveKey', 'deriveBits' ])
    .then(({ privateKey, publicKey }) => {
      return {
        privateKey,
        publicKey
      }
    })
    .catch(err => {
      console.error(err)
      throw Error('could not create public key')
    })
}

const exportKey = (key) => {
  return crypto.subtle.exportKey(
    keyFormat, // can be "jwk" (public or private), "raw" (public only), "spki" (public only), or "pkcs8" (private only)
    key // can be a publicKey or privateKey, as long as extractable was true
  )
    .then(keydata => {
      // returns the exported key data
      // console.log(keydata)
      return keydata
    })
    .catch(err => {
      console.error(err)
    })
}

const importKey = (key) => {
  return crypto.subtle.importKey(
    keyFormat, // can be "jwk" (public or private), "raw" (public only), "spki" (public only), or "pkcs8" (private only)
    key,
    {   // these are the algorithm options
      name: algorithm,
      namedCurve // can be "P-256", "P-384", or "P-521"
    },
    true, // whether the key is extractable (i.e. can be used in exportKey)
    [] // "deriveKey" and/or "deriveBits" for private keys only (just put an empty list if importing a public key)
  )
    .then(key => {
      // returns a privateKey (or publicKey if you are importing a public key)
      // console.log(key)
      return key
    })
    .catch(err => {
      console.error(err)
    })
}

const deriveKey = (privateKey, publicKey) => {
  return crypto.subtle.deriveKey(
    {
      name: algorithm,
      namedCurve, // can be "P-256", "P-384", or "P-521"
      public: publicKey // an ECDH public key from generateKey or importKey
    },
    privateKey, // your ECDH private key from generateKey or importKey
    { // the key type you want to create based on the derived bits
      name: symmetric, // can be any AES algorithm ("AES-CTR", "AES-CBC", "AES-CMAC", "AES-GCM", "AES-CFB", "AES-KW", "ECDH", "DH", or "HMAC")
      // the generateKey parameters for that type of algorithm
      length // can be  128, 192, or 256
    },
    false, // whether the derived key is extractable (i.e. can be used in exportKey)
    [ 'encrypt', 'decrypt' ] // limited to the options in that algorithm's importKey
  )
    .then(symmetricKey => {
      // returns the exported key data
      // console.log(symmetricKey)
      return { symmetricKey }
    })
    .catch(err => {
      console.error(err)
    })
}

/*
 const deriveBits = (privateKey, publicKey) => {
 return crypto.subtle.deriveBits(
 {
 name: algorithm,
 namedCurve, // can be "P-256", "P-384", or "P-521"
 public: publicKey // an ECDH public key from generateKey or importKey
 },
 privateKey, // your ECDH private key from generateKey or importKey
 bits // the number of bits you want to derive
 )
 .then(bits => {
 // returns the derived bits as an ArrayBuffer
 console.log(new Uint8Array(bits))
 })
 .catch(err => {
 console.error(err)
 })
 }
 */

const arrayToText = (array) => new TextDecoder('utf-8').decode(new Uint8Array(array))

const decrypt = (key, data) => {
  return crypto.subtle.decrypt(
    {
      name: symmetric,
      iv: data.iv, // The initialization vector you used to encrypt
      // additionalData: ArrayBuffer, //The addtionalData you used to encrypt (if any)
      tagLength // The tagLength you used to encrypt (if any)
    },
    key, // from generateKey or importKey above
    data.encrypted // ArrayBuffer of the data
  )
    .then(decrypted => {
      // returns an ArrayBuffer containing the decrypted data
      return arrayToText(decrypted)
    })
    .catch(err => {
      console.error(err)
    })
}

const encrypt = (key, data) => {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  return crypto.subtle.encrypt(
    {
      name: symmetric,

      // Don't re-use initialization vectors!
      // Always generate a new iv every time your encrypt!
      // Recommended to use 12 bytes length
      iv: iv,

      // Additional authentication data (optional)
      // additionalData: ArrayBuffer,

      // Tag length (optional)
      tagLength // can be 32, 64, 96, 104, 112, 120 or 128 (default)
    },
    key, // from generateKey or importKey above
    data // ArrayBuffer of data you want to encrypt
  )
    .then(encrypted => {
      // returns an ArrayBuffer containing the encrypted data
      // console.log(new Uint8Array(encrypted))
      return {
        encrypted,
        iv
      }
    })
    .catch(err => {
      console.error(err)
    })
}

export {
  arrayToText,
  createKeys,
  exportKey,
  importKey,
  deriveKey,
  encrypt,
  decrypt
}

# phog

```bash
yarn add phog
```

phog uses the Web Crypto API and base 58 encoding

clone the repo and open test.html in a browser to test

### phog configs
```javascript
phog.configs = {
  // ellpitic curve used for signatures
  sign: {
    algo: {name: 'ECDSA', namedCurve: 'P-256'},
    usage: ['sign', 'verify'],
    format: {public:'spki', private:'pkcs8'}
  },
  // create a shared secret with a friend's public key
  derive: {
    algo: {name:'ECDH', namedCurve:'P-256'},
    usage: ['deriveKey'],
    format: {public:'spki', private:'pkcs8'}
  },
  // symmetric encrypt using that secret
  encrypt: {
    algo: {name:'AES-GCM', length: 256},
    usage: ['encrypt', 'decrypt'],
    format: {public:'raw', private:'raw'},
    ivFunc: () => window.crypto.getRandomValues(new Uint8Array(12))
  }
}
```
# api
### keyGen (object)
Generate a key
```javascript
const key = await phog.keyGen(phog.configs.sign) // for signing
const key = await phog.keyGen(phog.configs.derive) // for deriving shared keys
// returns { publicKey:CryptoKey{}, privateKey:CryptoKey{} }
```
### sign (string, CryptoKey)
Sign some text
```javascript
const sig = await phog.sign(txt, key.privateKey)
// returns base58-encoded signature string
```
### verify (string, string, CryptoKey)
Verify a signature
```javascript
const verified = await phog.verify(txt, sig, importedPubKey)
// returns true/false
```
### deriveKey (CryptoKey, CryptoKey)
Derive a shared symmetric key from your private key and another person's public key.
```javascript
const secret = await phog.deriveKey(key.privateKey, key.publicKey)
// returns CryptoKey{}
```
### encrypt (string, CryptoKey)
Symmetrically encrypt some data
```javascript
const encrypted = await phog.encrypt(txt, secret)
// returns base58-encoded string
```
### decrypt (string, CryptoKey)
Decrypt some data
```javascript
const decrypted = await phog.decrypt(encrypted, secret)
// returns string
```
### exportKey (CryptoKey, object, string)
Export a public key to base58:
```javascript
const keyString = await phog.exportKey(key.publicKey, phog.configs.sign)
```
To export a private key, you must specify 'private' as the last argument:
```javascript
const keyString = await phog.exportKey(key.privateKey, phog.configs.sign, 'private')
```
### importKey (string, object, string)
Import a base58-encoded public key
```javascript
const key = await phog.importKey(keyString, phog.configs.sign)
```

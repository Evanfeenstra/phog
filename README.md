# phog
dead simple crypto functions for fognet
phog uses the Web Crypto API and base 58 encoding
open test.html in any browser to test
### phog configs
```json
const configs = {
  sign: {
    algo: {name: 'ECDSA', namedCurve: 'P-256'},
    usage: ['sign', 'verify'],
    export: {public:'spki', private:'pkcs8'}
  },
  derive: {
    algo: {name:'ECDH', namedCurve:'P-256'},
    usage: ['deriveKey'],
    export: {public:'spki', private:'pkcs8'}
  },
  encrypt: {
    algo: {name:'AES-GCM', length: 256},
    usage: ['encrypt', 'decrypt'],
    export: {public:'raw', private:'raw'},
    ivFunc: () => window.crypto.getRandomValues(new Uint8Array(12))
  }
}
```
# api
### keyGen (object)
Generate a key (returns a CryptoKey pair)
```javascript
const key = await phog.keyGen(phog.configs.sign) // for signing
const key = await phog.keyGen(phog.configs.derive) // for deriving shared keys
// returns { publicKey:CryptoKey{}, privateKey:CryptoKey{} }
```
### sign (string, CryptoKey)
Sign some text (returns base58-encoded signature string)
```javascript
const sig = await phog.sign(txt, key.privateKey)
```
### verify (string, string, CryptoKey)
Verify a signature (returns a bool)
```javascript
const verified = await phog.verify(txt, sig, importedPubKey)
```
### deriveKey (CryptoKey, CryptoKey)
Derive a shared symmetric key from your private key and another person's public key. (returns a CryptoKey)
```javascript
const secret = await phog.deriveKey(key.privateKey, key.publicKey)
```
### encrypt (string, CryptoKey)
Symmetrically encrypt some data (returns a base58-encoded string)
```javascript
const encrypted = await phog.encrypt(txt, secret)
```
### decrypt (string, CryptoKey)
Decrypt some data (returns a string)
```javascript
const decrypted = await phog.decrypt(encrypted, secret)
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
Import a base58-encoded public key (returns a CryptoKey)
```javascript
const key = await phog.importKey(keyString, phog.configs.sign)
```

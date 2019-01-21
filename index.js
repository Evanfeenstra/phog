const SimpleBase = require('simple-base')

// algos
// ECDSA for signing (P-256) 
// ECDH for key derivation (P-256)
// AES-GCM for symmetric
// SHA-256 for hashing
const hash_function = 'SHA-256'
const configs = {
  sign: {
    algo: {name: 'ECDSA', namedCurve: 'P-256'},
    usage: ['sign', 'verify'],
    format: {public:'spki', private:'pkcs8'}
  },
  derive: {
    algo: {name:'ECDH', namedCurve:'P-256'},
    usage: ['deriveKey'],
    format: {public:'spki', private:'pkcs8'}
  },
  encrypt: {
    algo: {name:'AES-GCM', length: 256},
    usage: ['encrypt', 'decrypt'],
    format: {public:'raw', private:'raw'},
    ivFunc: () => window.crypto.getRandomValues(new Uint8Array(12))
  }
}

function keyGen(config) {
  return crypto.subtle.generateKey(config.algo, true, config.usage);
}

async function exportKey(key, config, mode){
  const m = mode || 'public'
  const keyData = await window.crypto.subtle.exportKey(config.format[m], key)
  return ab_to_base58(keyData)
}

async function importKey(key, config, mode){
  const m = mode || 'public'
  return await window.crypto.subtle.importKey(
    config.format[m], 
    base58_to_ab(key),
    config.algo,
    true,
    [m==='public'?'verify':'sign']
  )
}

async function deriveKey(privKey, pubKey) {
  return crypto.subtle.deriveKey(
    {"name": configs.derive.algo.name, "public": pubKey},
    privKey,
    configs.encrypt.algo,
    true,
    configs.encrypt.usage
  );
}

async function hash(msg) {
  const msgUint8 = new TextEncoder('utf-8').encode(msg)
  const h = await window.crypto.subtle.digest(hash_function, msgUint8)
  return ab_to_base58(h)
}

async function encrypt(msg, key) {
  const iv = configs.encrypt.ivFunc()
  const d = await window.crypto.subtle.encrypt(
    {...configs.encrypt.algo, iv},
    key,
    new TextEncoder('utf-8').encode(msg)
  )
  return ab_to_base58(iv) + '_' + ab_to_base58(d)
}

async function decrypt(data, key) {
  const a = data.split('_')
  const d = await window.crypto.subtle.decrypt(
    {...configs.encrypt.algo, iv:base58_to_ab(a[0])},
    key,
    base58_to_ab(a[1])
  )
  return new TextDecoder('utf-8').decode(d)
}

async function sign(msg, privateKey) {
  const signature = await window.crypto.subtle.sign(
    {name:configs.sign.algo.name, hash: {name: hash_function}},
    privateKey,
    new TextEncoder('utf-8').encode(msg)
  ) // sig is ArrayBuffer
  const sig58 = ab_to_base58(signature)
  return sig58
}

async function verify(msg, sig, pubKey) {
  return await window.crypto.subtle.verify(
    {name:configs.sign.algo.name, hash: {name: hash_function}},
    pubKey, //from generateKey or importKey above
    base58_to_ab(sig),
    new TextEncoder('utf-8').encode(msg)
  )
}

function ab_to_base58(buf) {
  const s = String.fromCharCode.apply(null, new Uint8Array(buf))
  return SimpleBase.base58.encode(s)
}

function base58_to_ab(s) {
  var str = SimpleBase.base58.decode(s)
  var buf = new ArrayBuffer(str.length)
  var bufView = new Uint8Array(buf)
  for (var i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

module.exports = {
  hash_function,
  configs,
  keyGen,
  deriveKey,
  hash,
  encrypt,
  decrypt,
  sign,
  verify,
  importKey,
  exportKey,
}


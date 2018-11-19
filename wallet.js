const ElectrumCli = require('electrum-client');
const Odin        = require('odinjs-lib');
const Settings    = require('./config/');

const sleep = (ms) => new Promise((resolve,_) => setTimeout(() => resolve(), ms));
const rng   = () => { return Buffer.from('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz') }

const keyPair       = Odin.ECPair.makeRandom({ rng: rng });
const wif           = keyPair.toWIF();
const { address }   = Odin.payments.p2pkh({ pubkey: keyPair.publicKey });
const script        = Odin.address.toOutputScript(address);
const hash          = Odin.crypto.sha256(script);
const reversedHash  = new Buffer(hash.reverse()).toString('hex');

module.exports.address = address;
module.exports.wif     = wif;

let txHistory = [];
let balance = 0;
let unspent = [];

const Client = new ElectrumCli(
  Settings['electrumx']['port'],
  Settings['electrumx']['uri'],
  Settings['electrumx']['type']);

console.log(`
  Loading Electrum Client:\n
  \tAddress:\t${address}
  \tScript:\t\t${script.toString('hex')}
  \tHash:\t\t${hash.toString('hex')}
  \trHash:\t\t${reversedHash}\n`);

module.exports.send = async (transactionHex) => {
  try {
    return Client.blockchainTransaction_broadcast(transactionHex);
  } catch (e) {
    console.log('bad error', e);
    process.exit(0);
  }
}

module.exports.get = async (txid) => {
  try {
    return Client.blockchainTransaction_get(txid, true, true);
  } catch (e) {
    console.log('bad error', e);
    process.exit(0);
  }
}

module.exports.balance = async () => {
  try {
    return balance
  } catch (e) {
    console.log('bad error', e);
    process.exit(0);
  }
}

module.exports.history = async () => {
  try {
    return txHistory
  } catch (e) {
    console.log('bad error', e);
    process.exit(0);
  }
}

module.exports.unspent = async () => {
  try {
    return unspent
  } catch (e) {
    console.log('bad error', e);
    process.exit(0);
  }
}

module.exports.keypair = async () => {
  try {
    return keyPair
  } catch (e) {
    console.log('bad error', e);
    process.exit(0);
  }
}

module.exports.broadcastTx = async (txHex) => {
  try {
    console.log('broadcast:', txHex);
    
    let sent = await Client.blockchainTransaction_broadcast(txHex);
    return sent;
  } catch (e) {
    console.log('bad error', e);
    process.exit(0);
  }
}

module.exports.init = async () => {
  console.log('init wallet');

  Client.subscribe.on('blockchain.address.subscribe', async (address) => {
    console.log(`
    [ ElecrumX Address ]
    
    ${JSON.stringify(address)}\n`);
  });

  Client.subscribe.on('blockchain.scripthash.subscribe', async (scripthash) => {
    console.log('Refreshing balance, history, unspent');

    balance   = await Client.blockchainScripthash_getBalance(reversedHash);
    txHistory = await Client.blockchainScripthash_getHistory(reversedHash);
    unspent   = await Client.blockchainScripthash_listunspent(reversedHash);

    console.log({
      balance: balance,
      history: txHistory,
      unspent: unspent
    });
  });

  try {
    await Client.connect();
    await Client.server_version("2.7.11", "1.1");

    balance   = await Client.blockchainScripthash_getBalance(reversedHash);
    txHistory = await Client.blockchainScripthash_getHistory(reversedHash);
    unspent   = await Client.blockchainScripthash_listunspent(reversedHash);

    console.log({
      balance: balance,
      history: txHistory,
      unspent: unspent
    });

    const p3 = await Client.blockchainAddress_subscribe(address);
    const p4 = await Client.blockchainScripthash_subscribe(reversedHash);

    while(true) {
      await sleep(1000);
      const ver = await Client.server_version("2.7.11", "1.1");
    }
  } catch (e) {
    console.log('bad error', e);
    process.exit(0);
  }
}

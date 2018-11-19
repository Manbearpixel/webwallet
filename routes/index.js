let express = require('express');
let Odin        = require('odinjs-lib');
let router  = express.Router();
let wallet  = require('../wallet');

router.get('/', async function(req, res, next) {
  let data = {
    address: wallet.address,
    wif: wallet.wif,
    balance: await wallet.balance(),
    unspent: await wallet.unspent(),
    history: await wallet.history()
  };

  res.render('index', data);
});

router.get('/send', async function(req, res, next) {
  let data = {
    address: wallet.address,
    wif: wallet.wif,
    balance: await wallet.balance(),
    unspent: await wallet.unspent(),
    history: await wallet.history()
  };

  res.render('send', data);
});

router.post('/send', async function(req, res, next) {
  let postData  = req.body;
  let keyPair   = await wallet.keypair();

  // gather inputs from request body
  let inputs = [];
  for (rawKey of Object.keys(postData)) {
    if (rawKey.length >= 64) {
      rawKey = rawKey.split(':');
      inputs.push({ txid: rawKey[0], txPos: rawKey[1], amount: postData[rawKey.join(':')] });
    }
  }

  // build transaction object
  let tx = new Odin.TransactionBuilder();
  tx.setVersion(1);

  // add inputs
  for (input of inputs) {
    tx.addInput(input.txid, Number(input.txPos));
  }

  // add outputs
  tx.addOutput(postData.recipient, Number(postData.amount) * 1e8);
  if (Number(postData.change) > 0) {
    tx.addOutput(wallet.address, Number(postData.change) * 1e8);
  }

  // sign inputs
  for (i in inputs) {
    tx.sign(Number(i), keyPair);
  }

  // create signed transaction hex
  let signedTx  = tx.build().toHex();

  // broadcast transaction
  let broadcast = await wallet.broadcastTx(signedTx);

  let data = {
    balance:  await wallet.balance(),
    unspent:  await wallet.unspent(),
    history:  await wallet.history(),
    hex:      signedTx,
    response: broadcast
  };

  res.render('send', data);
});

module.exports = router;

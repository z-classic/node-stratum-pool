var bitcoin = require('bitcoinjs-lib-zcash');
var util = require('./util.js');

// public members
var txHash;

exports.txHash = function(){
  return txHash;
};

function scriptCompile(pubkey){
    script = bitcoin.script.compile(
        [
            bitcoin.opcodes.OP_DUP,
            bitcoin.opcodes.OP_HASH160,
            pubkey,
            bitcoin.opcodes.OP_EQUALVERIFY,
            bitcoin.opcodes.OP_CHECKSIG
        ]);
    return script;
}


exports.createGeneration = function(blockHeight, reward, recipients, poolAddress){
    var poolPubKey = bitcoin.address.fromBase58Check(poolAddress).hash;
    var tx = new bitcoin.Transaction();

    // input for coinbase tx
    if (blockHeight.toString(16).length % 2 === 0) {
        var blockHeightSerial = blockHeight.toString(16);
    } else {
        var blockHeightSerial = '0' + blockHeight.toString(16);
    }
    length = '0' + ((blockHeightSerial.length / 2) + 0);
    var serializedBlockHeight = Buffer.concat([
        new Buffer(length, 'hex'),
        util.reverseBuffer(Buffer(blockHeightSerial, 'hex')),
        new Buffer('00', 'hex') // OP_0
    ]);

    tx.addInput(new Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex'),
        4294967295,
        4294967295,
        Buffer.concat([serializedBlockHeight
            //Buffer('5a2d4e4f4d5021', 'hex')]) // Z-NOMP!
    ]));

    // calculate total fees
    var feePercent = 0;
    recipients.forEach(function(value) {
        feePercent = feePercent + recipients[value.fee];
    });

    // tx for mining pool
    tx.addOutput(
        scriptCompile(poolPubKey),
        reward * (1 - feePercent)
        );

    // tx for recipients
    recipients.forEach(function(value){
       tx.addOutput(
           recipients[value],
           reward * recipients[value.fee]
       )
    });

    // sign with random key
    txHex = tx.toHex();

    // assign
    txHash = tx.getHash().toString('hex');

    /*
    console.log('txHex: ' + txHex.toString('hex'));
    console.log('txHash: ' + txHash);
    */

    return txHex;
};

module.exports.getFees = function(feeArray){
    var fee = Number();
    feeArray.forEach(function(value) {
        fee = Math.abs(fee) + Number(value.fee);
    });
    return fee;
};

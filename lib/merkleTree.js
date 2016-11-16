var Promise = require('promise');
var merklebitcoin = Promise.denodeify(require('merkle-bitcoin'));
var util = require('./util.js');


function calcRoot(hashes) {
    var result = merklebitcoin(hashes);
    return result._65.root;
}

exports.getRoot = function (rpcData, generateTxRaw) {
    hashes = [generateTxRaw];
    rpcData.transactions.forEach(function (value) {
        hashes.push(value.hash);
    });
    if (hashes.length === 1) {
        result = util.reverseBuffer(Buffer(hashes[0], 'hex')).toString('hex');
        return result;
    }
    var result = calcRoot(hashes);
    return result;
};

// TODO - add error handling

const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');


// compile memo contract source
const memoPath = path.resolve('./ethereum/contracts/Memo.sol');
const input = {
  'Memo.sol': fs.readFileSync(memoPath, 'utf8'),
};

const compiled = solc.compile({sources: input}, 1).contracts;

// export compiled contract to build directory
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);
fs.ensureDirSync(buildPath);
for (let contract in compiled) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.split('.')[0] + '.json'),
    compiled[contract]
  );
}

console.log('contract compiled successfully');

// export compiled contracts if required directly
// module.exports = {
//     Memo: compiled[':Memo'],
// }
const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

try {

  // compile memo contract source
  const memoPath = path.resolve('./ethereum/contracts/Memo.sol');
  const input = {
    'Memo.sol': fs.readFileSync(memoPath, 'utf8'),
  };

  const compiled = solc.compile({sources: input}, 1).contracts;

  // verify compilation successful
  if (compiled['Memo.sol:Memo'] === undefined) {
    throw new Error('compilation failed')
  }

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
  
} catch (err) {
  console.log(err)
}
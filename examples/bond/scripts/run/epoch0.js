const {
  executeTransaction
} = require('@algo-builder/algob');
const { types } = require('@algo-builder/web');
const { accounts } = require('./common/accounts.js');
const { issuePrice } = require('./common/common.js');

/**
 * In this function: Elon buys 10 bonds and
 * Elon sells 2 bonds to bob for 2020 ALGO (in a group transaction)
 * @param deployer deployer object
 */
exports.epoch0 = async function (deployer) {
  const account = await accounts(deployer);
  const appInfo = deployer.getApp('bond-dapp-stateful.py', 'bond-dapp-clear.py');
  const scInitParam = {
    TMPL_APPLICATION_ID: appInfo.appID,
    TMPL_OWNER: account.creator.addr,
    TMPL_APP_MANAGER: account.manager.addr
  };
  const issuerLsig = await deployer.loadLogic('issuer-lsig.py', scInitParam);
  const asaInfo = deployer.getASAInfo('bond-token-0');
  await deployer.optInAcountToASA(asaInfo.assetIndex, 'bob', { totalFee: 1000 });
  await deployer.optInAcountToASA(asaInfo.assetIndex, 'elon-musk', { totalFee: 1000 });

  // elon buys 10 bonds
  const algoAmount = 10 * issuePrice;

  const groupTx = [
    // Algo transfer from buyer to issuer
    {
      type: types.TransactionType.TransferAlgo,
      sign: types.SignType.SecretKey,
      fromAccount: account.elon,
      toAccountAddr: issuerLsig.address(),
      amountMicroAlgos: algoAmount,
      payFlags: { totalFee: 2000 }
    },
    // Bond token transfer from issuer's address
    {
      type: types.TransactionType.TransferAsset,
      sign: types.SignType.LogicSignature,
      fromAccountAddr: issuerLsig.address(),
      lsig: issuerLsig,
      toAccountAddr: account.elon.addr,
      amount: 10,
      assetID: asaInfo.assetIndex,
      payFlags: { totalFee: 0 }
    },
    // call to bond-dapp
    {
      type: types.TransactionType.CallNoOpSSC,
      sign: types.SignType.SecretKey,
      fromAccount: account.elon,
      appID: appInfo.appID,
      payFlags: { totalFee: 1000 },
      appArgs: ['str:buy']
    }
  ];

  console.log('Elon buying 10 bonds!');
  await executeTransaction(deployer, groupTx);
  console.log('Elon bought 10 bonds!');

  // elon sells 2 bonds to bob for 2020 Algo
  const sellTx = [
    {
      type: types.TransactionType.TransferAlgo,
      sign: types.SignType.SecretKey,
      fromAccount: account.bob,
      toAccountAddr: account.elon.addr,
      amountMicroAlgos: 2020,
      payFlags: { totalFee: 1000 }
    },
    {
      type: types.TransactionType.TransferAsset,
      sign: types.SignType.SecretKey,
      fromAccount: account.elon,
      toAccountAddr: account.bob.addr,
      amount: 2,
      assetID: asaInfo.assetIndex,
      payFlags: { totalFee: 1000 }
    }
  ];
  await executeTransaction(deployer, sellTx);
  console.log('2 bonds sold to bob from elon!');
};

const { readGlobalStateSSC, executeTransaction } = require('@algo-builder/algob');
const { types } = require('@algo-builder/web');

async function run (runtimeEnv, deployer) {
  const creatorAccount = deployer.accountsByName.get('alice');

  // Retreive AppInfo from checkpoints.
  const appInfo = deployer.getApp('approval_program.teal', 'clear_program.teal');
  const applicationID = appInfo.appID;
  console.log('Application Id ', applicationID);

  // Retreive Global State
  let globalState = await readGlobalStateSSC(deployer, creatorAccount.addr, applicationID);
  console.log(globalState);

  const tx = {
    type: types.TransactionType.CallNoOpSSC,
    sign: types.SignType.SecretKey,
    fromAccount: creatorAccount,
    appID: applicationID,
    payFlags: {}
  };

  await executeTransaction(deployer, tx);

  /* Uncomment below code to start debugger  */
  // await new Tealdbg(deployer, tx)
  //   .run({ tealFile: "approval_program.teal" });

  globalState = await readGlobalStateSSC(deployer, creatorAccount.addr, applicationID);
  console.log(globalState);
}

module.exports = { default: run };

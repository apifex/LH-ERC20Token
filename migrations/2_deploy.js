// migrations/2_deploy.js

const ProxyFace = artifacts.require('ProxyFace');
const LHToken_V1 = artifacts.require('LHToken_V1');

module.exports = async function (deployer) {
  let logicAddress;
  await deployer.deploy(LHToken_V1).
  then(()=> logicAddress = LHToken_V1.address)
  
  console.log("Logic address: ", logicAddress)

  let data =  await web3.eth.abi.encodeFunctionCall({
    name: 'initialize',
    type: 'function',
    inputs: [{
        type: 'string',
        name: 'name'
    },{
        type: 'string',
        name: 'symbol',
    },{
        type: 'uint256',
        name: 'initialSupply'
    },{
        type: 'uint8',
        name: 'decimals',
    },{
        type: 'uint256',
        name: 'burnLevel',
    },{
        type: 'uint256',
        name: 'profitLevel',
    }]
  }, ["LHTokenERC20", "LHT", "1000000", "18", "5", "15"])

  const accounts = await web3.eth.getAccounts()
  await deployer.deploy(ProxyFace, logicAddress, data, accounts[accounts.length - 1])
  console.log("Proxy Admin address: ", accounts[accounts.length - 1])
  const deployedProxy = await ProxyFace.deployed()
  console.log("Proxy address: ", deployedProxy.address)
};

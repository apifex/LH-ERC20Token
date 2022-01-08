// scripts/index.js
let LHToken_ver = 'LHToken_V1'

module.exports = async function main(callback) {
    try {
        const accounts = await web3.eth.getAccounts();
    
        const LHToken = artifacts.require(LHToken_ver);
        const ProxyFace = artifacts.require('ProxyFace');
        const ProxyProps = await ProxyFace.deployed()
        
        console.log('LHToken initial address: ', LHToken.address)
        console.log('Proxy address: ', ProxyProps.address)
        LHToken.address = ProxyProps.address;
        console.log('LHToken proxied address: ',LHToken.address)
        
        const token = await LHToken.deployed()
        
        await token.approve(accounts[1], '2000')
        await token.transfer(accounts[1], '250')
        // await token.transfer(accounts[2], '3000')
        // await token.transfer(accounts[3], '2000')

        await token.transferFrom(accounts[0], accounts[2], '1000', {from: accounts[1]})
     
        async function balances () {
            await accounts.reduce(async(promise, el, index) => {
                await promise;
                console.log('account', index , el , (await token.balanceOf(accounts[index])).toString())
            }, [])
        }
        
        console.log('TotalSupply ', (await token.totalSupply()).toString())
        console.log('TotalBalance ', (await token.globalBalance()).toString())

        await balances()

        callback(0);
    } catch (error) {
        console.error(error);
        callback(1);
    }
};


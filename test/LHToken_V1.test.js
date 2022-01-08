const { expect } = require('chai');
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const LHToken_V1 = artifacts.require('LHToken_V1')
// class Registry {
//     static contracts = {
//         token: ...
//     }
// }
contract('LHToken_V1', function () {
    beforeEach(async function () {
        this.lhtoken = await LHToken_V1.new()
        await this.lhtoken.initialize('LHTOKEN', 'LHE2', '1000000', '5', '15')
    })

    it('do not allow initialize, if initialized before', async function () {
        expectRevert(
            this.lhtoken.initialize('LHTOKEN', 'LHE2', '1000000', '5', '15'),
            "Contract has been initialized before."
        )
    })

    it('returns totalSupply', async function () {
        expect((await this.lhtoken.totalSupply()).toString()).to.equal('1000000')
    })

    it('returns name', async function () {
        expect((await this.lhtoken.name()).toString()).to.equal('LHTOKEN')
    })

    it('returns symbol', async function () {
        expect((await this.lhtoken.symbol()).toString()).to.equal('LHE2')
    })

    it('returns balnce of owner', async function () {
        const accounts = await web3.eth.getAccounts()
        expect((await this.lhtoken.balanceOf(accounts[0])).toString()).to.equal('1000000')
    })

    it('transfers 1000 from owner to user, burn 5, and give 15 to all', async function () {
        const accounts = await web3.eth.getAccounts()
        await this.lhtoken.transfer(accounts[1], '1000')
        expect((await this.lhtoken.totalSupply()).toString()).to.equal('999995')
        expect((await this.lhtoken.balanceOf(accounts[0])).toString()).to.equal('999015')
        expect((await this.lhtoken.balanceOf(accounts[1])).toString()).to.equal('980')
    })

    it('transfers differents amounts from owner to users, burn 0.5%, and give 1.5% to all', async function () {
        const accounts = await web3.eth.getAccounts()
        await this.lhtoken.transfer(accounts[1], '1000')
        await this.lhtoken.transfer(accounts[2], '2000')
        await this.lhtoken.transfer(accounts[3], '5000')
        await this.lhtoken.transfer(accounts[4], '10000')

        let total = 1000000 - (1000 * 5 / 1000) - (2000 * 5 / 1000) - (5000 * 5 / 1000) - (10000 * 5 / 1000)
        let balanceOwner = 1000000 - 1000 - 2000 - 5000 - 10000 + (1000 * 15 / 1000) / 1 + (2000 * 15 / 1000) / 2 + (5000 * 15 / 1000) / 3 + (10000 * 15 / 1000) / 4
        let balanceOwner1 = 980 + (2000 * 15 / 1000) / 2 + (5000 * 15 / 1000) / 3 + (10000 * 15 / 1000) / 4

        expect((await this.lhtoken.totalSupply()).toString()).to.equal(total.toString())
        expect((await this.lhtoken.balanceOf(accounts[0])).toString()).to.equal(Math.floor(balanceOwner).toString())
        expect((await this.lhtoken.balanceOf(accounts[1])).toString()).to.equal(Math.floor(balanceOwner1).toString())
        expect((await this.lhtoken.balanceOf(accounts[4])).toString()).to.equal('9800')
    })

    it('transfers differents amounts from owner to users, burn 0.5%, and give 1.5% to all, delete owners when their balance is 0', async function () {
        const accounts = await web3.eth.getAccounts()
        await this.lhtoken.transfer(accounts[1], '1000')
        await this.lhtoken.transfer(accounts[2], '2000')
        await this.lhtoken.transfer(accounts[3], '1960', { from: accounts[2] })
        await this.lhtoken.transfer(accounts[4], '10000')

        let total = 1000000 - (1000 * 5 / 1000) - Math.floor(2000 * 5 / 1000) - Math.floor(1960 * 5 / 1000) - Math.floor(10000 * 5 / 1000)
        let balanceOwner = 1000000 - 1000 - 2000 - 10000 + Math.floor(1000 * 15 / 1000) / 1 + Math.floor(2000 * 15 / 1000) / 2 + Math.floor(1960 * 15 / 1000) / 2 + Math.floor(10000 * 15 / 1000) / 3
        let balanceOwner1 = 980 + Math.floor(2000 * 15 / 1000) / 2 + Math.floor(1960 * 15 / 1000) / 2 + Math.floor(10000 * 15 / 1000) / 3

        expect((await this.lhtoken.totalSupply()).toString()).to.equal(total.toString())
        expect((await this.lhtoken.balanceOf(accounts[0])).toString()).to.equal(Math.floor(balanceOwner).toString())
        expect((await this.lhtoken.balanceOf(accounts[1])).toString()).to.equal(Math.floor(balanceOwner1).toString())
        expect((await this.lhtoken.balanceOf(accounts[4])).toString()).to.equal('9800')
        expect((await this.lhtoken.balanceOf(accounts[2])).toString()).to.equal('0')
    })

    it('do not allow transfer less than 1000', async function() {
        const accounts = await web3.eth.getAccounts()
        await expectRevert(
            this.lhtoken.transfer(accounts[1], '200'),
            "Transfer amount too small."
        )
    })

    it('transfer emits an event', async function () {
        const accounts = await web3.eth.getAccounts()
        const receipt = await this.lhtoken.transfer(accounts[1], '1000')
        expectEvent(receipt, 'Transfer', { from: accounts[0], to: accounts[1], value: '1000' })
    })

    it('approve fn emits an event', async function () {
        const accounts = await web3.eth.getAccounts()
        const receipt = await this.lhtoken.approve(accounts[1], '1000')
        expectEvent(receipt, 'Approval', { owner: accounts[0], spender: accounts[1], value: '1000' })
    })

    it('approves user and do transferFrom', async function () {
        const accounts = await web3.eth.getAccounts()
        await this.lhtoken.approve(accounts[1], '10000')
        await this.lhtoken.transferFrom(accounts[0], accounts[2], '2000', { from: accounts[1] })
        expect((await this.lhtoken.allowance(accounts[0], accounts[1])).toString()).to.equal('10000')
        expect((await this.lhtoken.balanceOf(accounts[2])).toString()).to.equal('1960')
    })

    it('not owner can not transfer', async function () {
        const accounts = await web3.eth.getAccounts()
        await expectRevert(
            this.lhtoken.transfer(accounts[1], '1000', { from: accounts[2] }),
            "Transfer amount exceeds balance"
        )
    })

    it('transfer to zero address not allowed', async function () {
        await expectRevert(
            this.lhtoken.transfer('0x0000000000000000000000000000000000000000', '1000'),
            "Transfer to zero address."
        )
    })

    it('transfer amount exceeds balance', async function () {
        const accounts = await web3.eth.getAccounts()
        await expectRevert(
            this.lhtoken.transfer(accounts[1], '2000000'),
            "Transfer amount exceeds balance."
        )
    })

})


const Web3 = require('web3')
const fs = require('fs')

const LHContractJSON = fs.readFileSync('./build/contracts/LHToken_V1.json')

const lhabi = JSON.parse(LHContractJSON)
const web3 = new Web3(Web3.givenProvider || "ws://127.0.0.1:8545")

const token = new web3.eth.Contract(lhabi.abi)

//TODO set token address automaticly
token.options.address = ''

const listen = async () => {
    await token.events.allEvents()  
    .on('data', event => console.log(event.event, event.returnValues))
    .on('changed', changed => console.log(changed))
    .on('error', err => {console.log('errrr'); throw err})
    .on('connected', str => console.log(str))
}
listen()

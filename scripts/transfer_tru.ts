/**
 * INSTRUCTIONS:
 * 1. Create CSV With TRU amounts WITHOUT 8 Decimals
 * e.g. 10 TRU = 10
 * Format each row of the CSV in in the following way (no column titles)
 * address,amount
 *
 * 2. Transfer the total amount of TRU to a new account with 0 TRU balance
 *
 * PRIVATE_KEY={private_key} ts-node scripts/transfer_tru.ts "{network}" {path_to_csv}
 * Example:
 * PRIVATE_KEY="0x123.....123" ts-node scripts/transfer_tru.ts "mainnet" ~/Downloads/tru.csv
 */
import fs from 'fs'
import { ethers, providers, BigNumber } from 'ethers'
import { toTrustToken, fromTrustToken } from './utils'

import {
  TrustToken__factory,
} from '../build'

// format for account
export interface Account {
  address: string,
  amount: string,
}

// inputs
const truAddressMainnet = '0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784' // TRU Mainnet
const txnArgs = { gasLimit: 120_000, gasPrice: 40_000_000_000 }

// testnet
let truAddress = '0x8695B9e52a79f12E032928ee4611567c74295dFD' // TRU Ropsten

async function transferTru () {
  const network = process.argv[2]
  const path = process.argv[3]
  const provider = new providers.InfuraProvider(network, 'e33335b99d78415b82f8b9bc5fdc44c0')
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

  if (network === 'mainnet') {
    truAddress = truAddressMainnet
  }

  // get accounts from csv or JSON
  const accounts: Account[] = await getAccounts(path)
  const tru = await TrustToken__factory.connect(truAddress, wallet)

  // get total send and account balance
  let total = BigNumber.from(0)
  for (let i = 0; i < accounts.length; i++) {
    total = toTrustToken(accounts[i].amount).add(total)
  }
  const balance = await tru.balanceOf(wallet.address)
  console.log('Transferring ', fromTrustToken(total).toString(), ' TRU')

  // check account has enough balance
  if (balance.lt(total)) {
    // not enough balance
    console.log('INSUFFICIENT BALANCE')
  } else {
    // loop and send
    for (let i = 0; i < accounts.length; i++) {
      await sendTru(tru, accounts[i].address, toTrustToken(accounts[i].amount))
    }
  }

  console.log('\nDONE.')
}

// fill in amounts to create custom transfer list
function getJsonAccounts (): Account[] {
  return [
    // { amount: 0, address: '0xEF82e7E85061bd800c040D87D159F769a6b85264' },
  ]
}

// amount = WITHOUT 8 decimals (1 TRU = 1)
async function sendTru (tru, address, amount) {
  await (await tru.transfer(address, amount, txnArgs)).wait()
  console.log('transferred ', fromTrustToken(amount).toString(), 'to: ', address)
}

// return parsed if CSV was passed, otherwise custom JSON function
async function getAccounts (path) {
  if (path !== '') {
    return readAccountList(path)
  } else {
    return getJsonAccounts()
  }
}

// CSV format must be:
// address,amount
export const parseAccountList = (text: string): Account[] =>
  text
    .split('\n')
    .filter((line) => line.split(',').length > 1)
    .map((line) => ({
      address: line.split(',')[0].trim(),
      amount: line.split(',')[1].trim(),
    }))

export const readAccountList = (filePath: string) => parseAccountList(fs.readFileSync(filePath).toString())

transferTru().catch(console.error)

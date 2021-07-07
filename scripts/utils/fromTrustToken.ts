import { BigNumberish, BigNumber } from 'ethers'

export const fromTrustToken = (amount: BigNumberish) => BigNumber.from(amount).div(1e8)

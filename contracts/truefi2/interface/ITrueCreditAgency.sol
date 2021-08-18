// SPDX-License-Identifier: MIT
pragma solidity 0.6.10;

import {ITrueFiPool2} from "./ITrueFiPool2.sol";

interface ITrueCreditAgency {
    function poolCreditValue(ITrueFiPool2 pool) external view returns (uint256);

    function borrowLimit(ITrueFiPool2 pool, address borrower) external view returns (uint256);
}

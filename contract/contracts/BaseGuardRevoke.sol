// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
}

contract BaseGuardRevoke {
    function revoke(address token, address spender) external {
        IERC20(token).approve(spender, 0);
    }

    function massRevoke(address[] calldata tokens, address[] calldata spenders) external {
        require(tokens.length == spenders.length, "Mismatch");
        for (uint256 i = 0; i < tokens.length; i++) {
            IERC20(tokens[i]).approve(spenders[i], 0);
        }
    }
}
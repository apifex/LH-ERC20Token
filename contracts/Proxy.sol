// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

abstract contract Proxy {
    
    function _delegate(address implementation) internal virtual {
        emit ProxyCall(msg.sender, 11);
        assembly {
            calldatacopy(0, 0, calldatasize())

            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

            returndatacopy(0, 0, returndatasize())

            switch result

            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

   
    function _implementation() internal view virtual returns (address);

   
    function _fallback() internal virtual {
        _delegate(_implementation());
    }

    fallback() external payable virtual {
        emit ProxyCall(msg.sender, 88);
        _fallback();
    }

    receive() external payable virtual {
        emit ProxyCall(msg.sender, 99);
        _fallback();
    }


    event ProxyCall(address sender, uint256 code);
}
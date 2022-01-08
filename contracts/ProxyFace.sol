// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Proxy.sol";
import "./ProxyUpgrade.sol";

contract ProxyFace is Proxy, ProxyUpgrade{
    
    /**
     * @dev Initializes the upgradeable proxy with an initial implementation specified by `_logic`.
     *
     * If `_data` is nonempty, it's used as data in a delegate call to `_logic`. This will typically be an encoded
     * function call, and allows initializating the storage of the proxy like a Solidity constructor.
     */
    constructor(address _logic, bytes memory _data, address _admin) payable {
        assert(_IMPLEMENTATION_SLOT == bytes32(uint256(keccak256("apifexproxy"))));
        if(_data.length > 0) {
            _upgradeToAndCall(_logic, _data);
        } else {
            _upgradeTo(_logic);
        }
        _changeAdmin(_admin);

    }

    function upgradeTo(address newImplementation) external {
        _upgradeTo(newImplementation);
    }

    function changeAdmin(address newAdmin) external virtual {
        _changeAdmin(newAdmin);
    }
    /**
     * @dev Returns the current implementation address.
     */
    function _implementation() internal view virtual override returns (address) {
        return ProxyUpgrade._getImplementation();
    }
}
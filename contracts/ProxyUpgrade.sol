// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (proxy/ERC1967/ERC1967Upgrade.sol)

pragma solidity ^0.8.2;

import "./StorageSlot.sol";

abstract contract ProxyUpgrade {
    
    //implementation slot address is the keccak-256 hash of "apifexproxy" 
    bytes32 internal constant _IMPLEMENTATION_SLOT = 0xb0f8332778b54277497ed1e60ab83e2f096210742513441b896d54b91196599d;

    event Upgraded(address indexed implementation, bool status);

    function _getImplementation() internal view returns (address) {
        return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
    }
     
    function _upgradeTo(address newImplementation) internal returns(bool) {
        StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
         emit Upgraded(newImplementation, true);
        return true;
    }

    function _upgradeToAndCall (address newImplementation, bytes memory data) internal returns(bool) {
        require(newImplementation.code.length > 0, "Implementation address is not a contract!");
        StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
        (bool success, bytes memory returned) = newImplementation
        .delegatecall(data);
        emit Upgraded(newImplementation, success);
        return abi.decode(returned, (bool));
    }

    // admin slot address is the keccak-256 hash of "apifexproxyadmin"
    bytes32 internal constant _ADMIN_SLOT = 0x43433d98fbd95d6a89e9ba0edf309142ffa6c352e41668c5ad3215ccf546ad5f;

    event AdminChanged(address newAdmin);

    function _getAdmin() internal view returns (address) {
        return StorageSlot.getAddressSlot(_ADMIN_SLOT).value;
    }

    function _setAdmin(address newAdmin) private {
        require(newAdmin != address(0), "ERC1967: new admin is the zero address");
        StorageSlot.getAddressSlot(_ADMIN_SLOT).value = newAdmin;
    }

    function _changeAdmin(address _admin) internal {
        emit AdminChanged(_admin);
        _setAdmin(_admin);
    }
}
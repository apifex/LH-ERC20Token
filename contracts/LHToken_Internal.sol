// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IERC20.sol";

abstract contract LHToken_Internal is IERC20{
    bool initialized;
    string internal _name;
    string internal _symbol;
    address internal immutable __self = address(this);
    uint256 internal _burnLevel;
    uint256 internal _profitLevel;
    uint8 internal _decimals;
    mapping(address => uint256) internal _balances;
    mapping(address => mapping(address => uint256)) internal _allowances;
    uint256 internal _totalSupply;
    address[] internal _holders;
    mapping(address => bool) internal _isHolder;
    

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "Mint to the zero address");
        _totalSupply = amount * (10 ** _decimals);
        _balances[account] = amount * (10 ** _decimals);
        addHolderIfNotExists(account);
        emit Mint(tx.origin, account, amount);
    }

     function _transfer(
        address _from,
        address _to,
        uint256 value
    ) internal returns (bool) {
        require(_to != address(0), "Transfer to zero address.");
        uint256 _value = value  * (10 ** _decimals);
        uint256 senderBalance = _balances[_from];
        require(senderBalance >= _value, "Transfer amount exceeds balance.");
        _balances[_from] -= _value;
        if ( _balances[_from] == 0) deleteHolder(_from);
        uint256 burned = (_value * _burnLevel) / 1000;
        uint256 tax = (_value * _profitLevel) / 1000;
        burn(burned);
        giveProfitToAll(tax);
        addHolderIfNotExists(_to);
        uint256 receiverBalance = _balances[_to];
        _balances[_to] = receiverBalance + _value - burned - tax;
        emit Transfer(_from, _to, _value / (10 ** _decimals));
        return true;
    }

    function _approve(
        address owner,
        address spender,
        uint256 value
    ) internal returns (bool) {
        require(spender != address(0), "Spender address is zero address.");
        require(value > 0, "Value to approve should be greater than 0.");
        _allowances[owner][spender] = value * (10 ** _decimals);
        emit Approval(owner, spender, value);
        return true;
    }

    function burn(uint256 amount) internal {
            _totalSupply = _totalSupply - amount;
    }

    function addHolderIfNotExists(address holder) internal {
        if (_isHolder[holder] != true) {
            _isHolder[holder] = true;
            _holders.push(holder);
            emit Holder(holder, true);
        }
    }

    function deleteHolder(address holder) internal {
        for (uint256 i = 0; i < _holders.length; i++) {
            if (_holders[i] == holder) {
                _holders[i] = _holders[_holders.length - 1];
                _holders.pop();
                i = _holders.length;
                _isHolder[holder] = false;
                emit Holder(holder, false);
            }
        }
    }

    function giveProfitToAll(uint256 _amount) internal {
        uint256 amount = _amount / _holders.length;
        for (uint256 i = 0; i < _holders.length; i++) {
            _balances[_holders[i]] += amount;
        }
    }


}
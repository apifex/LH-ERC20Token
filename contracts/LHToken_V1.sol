// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LHToken_Internal.sol";

contract LHToken_V1 is LHToken_Internal {
     
    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        uint8 decimals,
        uint256 burnLevel,
        uint256 profitLevel
    ) external returns (bool) {
        require(!initialized, 'Contract has been initialized before.');
        initialized = true;
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals;
        _burnLevel = burnLevel;
        _profitLevel = profitLevel;
        _mint(msg.sender, initialSupply);
        return true;
    }

    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply / (10 ** _decimals);
    }

    function balanceOf(address who) external view override returns (uint256) {
        return _balances[who] / (10 ** _decimals);
    }

    function allowance(address owner, address spender)
        external
        view
        override
        returns (uint256)
    {
        return _allowances[owner][spender] / (10 ** _decimals);
    }

    function transfer(address to, uint256 value)
        external
        override
        returns (bool)
    {
        return _transfer(msg.sender, to, value);
    }

    function approve(address spender, uint256 value)
        external
        override
        returns (bool)
    {
        return _approve(msg.sender, spender, value);
    }
    
    //https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
    //https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit
    //https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729

    function decreaseAllowance(address spender, uint256 subtractedValue) 
        external returns (bool)
    {
        uint256 currentAllowance = _allowances[msg.sender][spender];
        require(currentAllowance >= subtractedValue, "decreased allowance below zero");
        _approve(msg.sender, spender, currentAllowance - subtractedValue);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) 
        external returns (bool)
    {
        uint256 currentAllowance = _allowances[msg.sender][spender];
        _approve(msg.sender, spender, currentAllowance + addedValue);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external override returns (bool) {
        require(_allowances[from][msg.sender] >= value, "Not allowed.");
        return _transfer(from, to, value);
    }

}

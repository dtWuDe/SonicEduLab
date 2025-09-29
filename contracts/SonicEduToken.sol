// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SonicEduToken is Ownable, ERC20, ERC20Permit {
   
   constructor(uint256 initialSupply, address initialOwnable) Ownable(initialOwnable) ERC20("SonicEduToken", "SET") ERC20Permit("SonicEduToken") {
      _mint(initialOwnable, initialSupply);
   }

   // fucntion allow onwer mint new tokens to any address
   function mint(address to, uint256 amount) public onlyOwner  {
      _mint(to, amount);
   }
}
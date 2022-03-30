// Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//import "./interfaces/Struct.sol";

//import {StringUtils} from "./libraries/StringUtils.sol";
//import {Base64} from "./libraries/Base64.sol";

contract UkraineArtCoNFT is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address payable public charityDestinationWallet;
    mapping(uint =>uint) public marketItems;

  event MarketItemSold (
        uint indexed tokenId,
        address owner
    );
    
    constructor() ERC1155("") {
        charityDestinationWallet = payable(0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2);
    }

    function mint(string memory tokenUri) public payable returns (uint256) {
        require(msg.value > 3*10**16, "Minimum 0.03 ETH is not met.");

       
        uint256 newItemId = _tokenIds.current();
        marketItems[newItemId] = msg.value;

        _mint(msg.sender, newItemId, 1, ""); 
        _setURI(tokenUri);
        // _setTokenRoyalty(newItemId, charityDestinationWallet, 10);
        _tokenIds.increment();
        emit MarketItemSold(newItemId, msg.sender);
        payable(charityDestinationWallet).transfer(msg.value);
        return newItemId;
    }

    function setURI(string memory newUri) public onlyOwner {
        _setURI(newUri);
    }
}

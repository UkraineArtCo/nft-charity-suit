// Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/Struct.sol";

import {StringUtils} from "./libraries/StringUtils.sol";
import {Base64} from "./libraries/Base64.sol";

contract UkraineArtCoNFT is ERC1155, Ownable, Struct {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address payable public charityDestinationWallet;
    mapping(uint => MarketItem) public marketItems;

    constructor() ERC1155("") {
        charityDestinationWallet = payable(0x2c3108dA62edd2835F4B5E471Af6401f0990Dadc);
    }

    function mint(string memory tokenUri) public payable returns (uint256) {
        require(msg.value > 3*10**16, "Minimum 0.03 ETH is not met.");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        marketItems[newItemId] = MarketItem(newItemId, msg.value);

        _mint(msg.sender, newItemId, msg.value, "");
        _setURI(tokenUri);
        // _setTokenRoyalty(newItemId, charityDestinationWallet, 10);

        emit MarketItemSold(newItemId, msg.sender);

        return newItemId;
    }

    function setURI(string memory newUri) public onlyOwner {
        _setURI(newUri);
    }
}

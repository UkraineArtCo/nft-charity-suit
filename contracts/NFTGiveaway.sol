// Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "./interfaces/Struct.sol";

import {StringUtils} from "./libraries/StringUtils.sol";
import {Base64} from "./libraries/Base64.sol";


contract SaveUkraineNFT is ERC721URIStorage, Ownable, Struct {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public firstBayer;
    address public copyOfOwner;

    constructor() ERC721("SaveUkraineNFT", "NFT") {
        copyOfOwner = msg.sender;
    }

    function calculateSoldRate() public pure returns(uint256) {
        return 0;
    }

    function mintNFT(string memory tokenURI) public payable returns (uint256) {

        require(msg.value >= 1, "Minimum 1 Matic is not met");

        if (_tokenIds.current() == 0) {
            firstBayer = msg.sender;
        }

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        emit MarketItemSold(newItemId, msg.sender);

        return newItemId;
    }
}
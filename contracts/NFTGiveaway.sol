// Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "./interfaces/Struct.sol";

import {StringUtils} from "./libraries/StringUtils.sol";
import {Base64} from "./libraries/Base64.sol";

// ERC721Royalty
contract UkraineArtCoNFT is ERC721URIStorage, Ownable, Struct {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public firstBayer;
    address payable public charityDestinationWallet;
    mapping(uint => MarketItem) public marketItems;

    constructor() ERC721("UkraineArtCo", "NFT") {
        charityDestinationWallet = payable(0x2c3108dA62edd2835F4B5E471Af6401f0990Dadc);
    }

    function setTokenRoyalty(
        uint256 tokenId,
        address recipient,
        uint96 fraction
    ) public {
        // _setTokenRoyalty(tokenId, recipient, fraction);
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
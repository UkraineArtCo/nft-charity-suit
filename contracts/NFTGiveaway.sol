//SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract UkraineArtCoNFT is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address payable public charityDestinationWallet;
    mapping(uint =>uint) public marketItems;
    
    uint256 public minimumDonation; 
    
    event MarketItemSold (
        uint indexed tokenId,
        address owner
    );
    
    constructor() ERC1155("") {
        charityDestinationWallet = payable(0xA4166BC4Be559b762B346CB4AAad3b051E584E39); //Razom charity ETH wallet
        minimumDonation = 1*10**16;
    }

    function setMinimumDonation(uint256 newValue) public onlyOwner {
    minimumDonation = newValue;
       } 

    function setDonationWallet(address payable newWallet) public onlyOwner {
    charityDestinationWallet = payable(newWallet);   
    } 

    function mint(string memory tokenUri) public payable returns (uint256) {
        require(msg.value >= minimumDonation, "Minimum donation is not met.");

        uint256 newItemId = _tokenIds.current();
        marketItems[newItemId] = msg.value;

        _mint(msg.sender, newItemId, 1, "");
        _setURI(tokenUri);
        _tokenIds.increment();
        emit MarketItemSold(newItemId, msg.sender);
        payable(charityDestinationWallet).transfer(msg.value);
        return newItemId;
    }

    function setURI(string memory newUri) public onlyOwner {
        _setURI(newUri);
    }
}

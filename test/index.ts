import { expect } from "chai";
import { ethers } from "hardhat";

describe("SaveUkraineNFT", function () {
  it("NFT contract core test", async function () {
    const NFTGiveaway = await ethers.getContractFactory("SaveUkraineNFT");
    const nftGiveaway = await NFTGiveaway.deploy();
    await nftGiveaway.deployed();

    const response = await nftGiveaway.mintNFT("0-x");

    // TODO

    expect(true).equal(true);
  });
});
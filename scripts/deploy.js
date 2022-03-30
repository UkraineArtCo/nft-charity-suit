const main = async () => {
  const NFTGiveway = await hre.ethers.getContractFactory("UkraineArtCoNFT");
  const deployed = await NFTGiveway.deploy();
  await deployed.deployed();

  console.log("Deployed to address:", deployed.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();

import React, { useEffect, useState } from "react";
import './styles/App.css';
import { ethers } from "ethers";
import polygonContractAbi from './utils/polygonContractABI.json';
import ethContractAbi from './utils/ethContractABI.json';

import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import twitterLogo from './assets/twitter-logo.svg';
import instagramLogo from './assets/instagram-logo.svg';
import faceboookLogo from './assets/facebook-logo.svg';
import tiktokLogo from './assets/tiktok-logo.svg';
import logoText from './assets/logo-text.png';
import logo from './assets/logo.png';
import { networks } from './utils/networks';

import FormData from 'form-data';
import axios from 'axios';
import { Buffer } from 'buffer';
import { number } from "prop-types";


// Constants
const TokenViewURLbase = "https://rarible.com/token/"; // change to "https://rarible.com/token/" OR "https://testnets.opensea.io/assets/" when on MAINNET; "https://rinkeby.rarible.com/token/" (change rinkeby to testnet name) OR "https://testnets.opensea.io/assets/" when on TESTNET
//const CONTRACT_ADDRESS = '0xfCd4B6a4DB7C06614f02ac4B5847EFf32c041496'; //rinkeby 
//const CONTRACT_ADDRESS = '0xCd5D8b3d0Ac393A7895e210f95475B4BA8e29C1a'; //mumbai 
 const CONTRACT_ADDRESS = '0x32251F5c7999b76Ab6C5e00DcAAb9Cd3134c1304'; //eth mainnet //eth contract address 0x32251F5c7999b76Ab6C5e00DcAAb9Cd3134c1304
const metadataURIpart = "ipfs://bafybeigy4mdgv7cwb6a7b5uz5g2z5lfeg2po3p6a772nx4zyul5jg2m554/metadata/"

const PNG_server = process.env.REACT_APP_PNG_SERVER || "http://localhost";
const PNG_port = process.env.REACT_APP_PNG_PORT || "";
const Server = PNG_server == "http://localhost"? PNG_server + ":" + PNG_port : PNG_server;
const API_KEY = process.env.REACT_APP_PIN_API_KEY;
const API_SECRET = process.env.REACT_APP_PIN_API_SECRET;


const App = () => {

	// Add some state data propertie
	const [name, setName] = useState('');
	const [amount, setAmount] = useState(0.01);
  	const [currentAccount, setCurrentAccount] = useState('');
	const [network, setNetwork] = useState('');
	const [bg, setBg] = useState('');
	// Add file state
	const [file, setFile] = useState();
	const [errorMessage, setErrorMessage] = useState('');
	const [ipfshash, setIpfshash] = useState('');
	const [tokenViewURL, setTokenViewURL] = useState('');
	const [currentPrice, setCurrentPrice] = useState(0);
	const [noMetaMask, setNoMetaMask] = useState(false);
	const [NFTName, setNFTName] = useState('');

	const pinataPinFileToIPFS = async () =>{

		// initialize the form data
		const formData = new FormData();
		var reqPars, resPars;
		// set PNG on a server
		reqPars = await serverSetPNG();

		// get PNG from a server
		if (reqPars && reqPars.success) {
			resPars = await serverGetPNG(reqPars);
			if (resPars.success && resPars.file && resPars.file.size > 0.1) {
				formData.append("file", resPars.file);
			} else {
				setErrorMessage('Could not retrieve NFT image, your funds were not affected. Try again...');
			}
		}
		console.log("CHECK:", resPars.file);

		var resIpfshash;
		if (resPars && resPars.success) {

			// the endpoint needed to upload the file
			const url =  `https://api.pinata.cloud/pinning/pinFileToIPFS`;
			const response = await axios.post(
				url,
				formData,
				{
				//   maxContentLength: "Infinity",
					headers: {
						"Content-Type": `multipart/form-data;boundary=${formData._boundary}`, 
						'pinata_api_key': API_KEY,
						'pinata_secret_api_key': API_SECRET
					}
				}
			)
			.then(function (response) {
				resIpfshash = response.data.IpfsHash;
				setIpfshash(resIpfshash);
				console.log(resIpfshash, typeof(resIpfshash));
				console.log("myipfsHash:", ipfshash);
				setErrorMessage('');
			})
			.catch(function (error) {
				console.log("file:", formData.file);
				setErrorMessage('Could not pin NFT, your funds were not affected. Try again...');
			});
		}
		resPars = await serverRemPNG(reqPars);

		console.log("pinToFile check:", resIpfshash, reqPars.filename);

		return {ipfshash: resIpfshash, filename: reqPars.filename};
	
	}

	const serverSetPNG = async () =>{

		// set png file on png server
		var success, png_subdir, png_filename;
		const setName = name=='' ? 'Anonymous' : name;
		await axios.get(Server+'/setPNG/donator/'+setName)
		.then(function (response) {
			success = true;
			png_subdir = response.data.subdir;
			png_filename = response.data.file;
			console.log("response:", response);
			console.log("setPNG:", png_subdir, png_filename);
		})
		.catch(function (error) {
			success = false;
			setErrorMessage('Could not generate NFT image, your funds were not affected. Try again...');
		});

		return {success: success, subdir: png_subdir, filename: png_filename};
	}

	const serverGetPNG = async (reqPars) =>{

		// get png file from png server
		var success = false;
		var ncounts = 0;
		const maxcounts = 5;

		var png_file;
		async function getPngTrial(reqPars) {
			ncounts += 1;
			await axios.get(Server+'/getPNG/filename/'+reqPars.filename,
			{ responseType: 'arraybuffer'})
			.then(function (response) {
				var buff = Buffer.from(response.data, 'base64');
				png_file = new File([buff], reqPars.filename, {type: "image/png"});
				console.log("png_file:", png_file);
				console.log("png_file.size:", png_file.size, typeof(png_file.size), png_file.size > 0.1);
				if (png_file.size > 0.1) {
					success = true;
					setFile(png_file);
				}
			})
			.catch(function (error) {
				console.log("serverGetPNG Error:", error);
			});
		}

		while (!success && ncounts <= maxcounts) {
			await getPngTrial(reqPars);
			console.log("getPngTrial attempt count:", ncounts);
		}
		if (!success && !errorMessage) {
			setErrorMessage('Could not retrieve NFT image, your funds were not affected. Try again...');
		}

		return {success: success, file: png_file};
	}

	const serverRemPNG = async (reqPars) =>{

		// get png file from png server
		var success = false
		await axios.get(Server+'/remPNG/filename/'+reqPars.filename)
		.then(function (response) {
			var text = response.data;
			success = true;
			console.log(text);
		})
		.catch(function (error) {
			if (!errorMessage) {
				console.log(reqPars.filename, "was not removed from server");
			}
		});

		return {success: success};
	}

	const getNFTCID = async () => {

		// var success, totalLeft, NFTid, CID;
		return await axios.get(Server+'/getMeta')
		.then(function (response) {
			console.log("response.data:", response.data);
			return {success: true, totalLeft: response.data.totalLeft, NFTid: response.data.NFTid, CID: response.data.CID};
		})
		.catch(function (error) {
			setErrorMessage('Could not get NFT data, your funds were not affected. Try again...');
			return {success: false, totalLeft: "", NFTid: "", CID: ""};
		});
		
	}

	const revertMeta = async (NFTid_, NFTcid_) => {

		return await axios.get(Server+'/revertMeta/id/:' + NFTid_ + '/CID/:' + NFTcid_)
		.then(function (response) {
			return response.data;
		})
		.catch(function (error) {
			//
		});
		
	}

	const getNFTMeta = async (CID_) => {

		return await axios.get('https://ipfs.io/ipfs/' + CID_ + '/metadata.json')
		.then(function (response) {
			console.log("response:", response);
			return response.data;
		})
		.catch(function (error) {
			setErrorMessage('Could not get NFT data, your funds were not affected. Try again...');
		});
		
	}

	const getIPFS = async () => {

		return await axios.get(Server+'/getIPFS')
		.then(function (response) {
			return response.data;
		})
		.catch(function (error) {
			//
		});
		
	}

	const revertIPFS = async (_NFTnameid) => {

		return await axios.get(Server+'/revertIPFS/fname/:' + _NFTnameid)
		.then(function (response) {
			return response.data;
		})
		.catch(function (error) {
			//
		});
		
	}

	const getNFTMetaJSON = async (_NFTnameid) => {

		return await axios.get('https://ipfs.io/ipfs/' + metadataURIpart.split("//")[1].split("/")[0] + '/metadata/' + _NFTnameid)
		.then(function (response) {
			console.log("response:", response);
			return response.data;
		})
		.catch(function (error) {
			setErrorMessage('Could not get NFT data, your funds were not affected. Try again...');
		});
		
	}

	const donateAmount = async () => {
	
		try {

			setErrorMessage('');
			const { ethereum } = window;

			if (!ethereum) {

				alert("Open inside your Metamask browser -> https://ukraine-art-co.vercel.app/");
				return;

			} else {

				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();

				console.log("network", network)

				if (Number(amount) >= 0.01) {

					const contract = new ethers.Contract(CONTRACT_ADDRESS, ethContractAbi.abi, signer);			
					const NFTnameId = Math.floor(Math.random()*150) + 1;
					const metadataURI = metadataURIpart + String(NFTnameId);
					const NFTMeta = await getNFTMetaJSON(NFTnameId);
					setNFTName(NFTMeta.name)
					console.log("Going to pop wallet now to pay gas...");
					try {
						let tx = await contract.mint(metadataURI, {value: ethers.utils.parseEther(String(amount))});
						// Wait for the transaction to be mined
						const receipt = await tx.wait();
						for (var ie = 0; ie < receipt["events"].length; ie++) {
							if (receipt["events"][ie]["event"] === "MarketItemSold") {
								if (TokenViewURLbase.includes("opensea")) {
									setTokenViewURL(TokenViewURLbase+CONTRACT_ADDRESS+"/"+String(parseInt(receipt["events"][ie]["args"]["tokenId"]["_hex"], 16)));
								} else if (TokenViewURLbase.includes("rarible")) {
									setTokenViewURL(TokenViewURLbase+CONTRACT_ADDRESS+":"+String(parseInt(receipt["events"][ie]["args"]["tokenId"]["_hex"], 16)));
								} else {
									console.log("unknown TokenViewURLbase");
								}
							}
						}
					} catch (error) {
						console.log(error);
						// console.log("message", error.data.message);
						setErrorMessage(error.data.message);
					}

				} else {

					setErrorMessage('Minimum ETH is 0.01');
					console.log("Minimum ETH is 0.01");

				}

			}

			// // Fancy method to request access to account.
			// const accounts = await ethereum.request({ method: "eth_requestAccounts" });
		
			// // Boom! This should print out public address once we authorize Metamask.
			// console.log("Connected", accounts[0]);
			// setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error)
		}
	}

	// Implement your connectWallet method here
	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				setNoMetaMask(true)
				// alert("Get MetaMask -> https://metamask.io/");
				return;
			}

			// Fancy method to request access to account.
			const accounts = await ethereum.request({ method: "eth_requestAccounts" });
		
			// Boom! This should print out public address once we authorize Metamask.
			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error)
		}
	}

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			console.log('Make sure you have metamask!');
			return;
		} else {
			console.log('We have the ethereum object', ethereum);
		}

		const accounts = await ethereum.request({ method: 'eth_accounts' });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log('Found an authorized account:', account);
			setCurrentAccount(account);
		} else {
			console.log('No authorized account found');
		}
		
		// This is the new part, we check the user's network chain ID
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		setNetwork(networks[chainId]);

		await getTokenPrice(networks[chainId]);

		ethereum.on('chainChanged', handleChainChanged);
		
		// Reload the page when they change networks
		function handleChainChanged(_chainId) {
			window.location.reload();
		}
	};

	// Render Methods
	const renderNotConnectedContainer = () =>{
		if (noMetaMask) {
			return renderMetamaskIO()
		} else {
			return renderConnectButton()
		}
	}

	const renderMetamaskIO = () => (
		<div className="connect-wallet-container">
			{/* Call the connectWallet function we just wrote when the button is clicked */}
			<a href="https://metamask.io/" target="_blank" rel="noreferrer noopener">
				Get Metamask for your browser
			</a>
		</div>
	)

	const renderConnectButton = () => (
		<div className="connect-wallet-container">
			{/* Call the connectWallet function we just wrote when the button is clicked */}
			<button onClick={connectWallet} className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
	)

	// Form to view NFT on OpenSea
	const renderWhenWalletConnected = () =>{
		if (tokenViewURL === '') {
			return renderInputForm()
		} else {
			return renderOpenseaView()
		}
	}
	// Form to enter donate amount
	const renderInputForm = () =>{
		return (
			<div className="form-container">
				<div className="first-row">
					<input
						type="number"
						value={amount}
						min="0.01"
						step="0.01"
						placeholder='Enter Amount'
						onChange={e => setAmount(e.target.value)}
					/>
					{currentPrice && <p className="current-price">${Math.round(((currentPrice*amount)+Number.EPSILON) * 100) / 100}~</p>}
				</div>
				<div className="button-container">
					{/* <input type="file" onChange={(event)=>setFile(event.target.files[0])}/> */}
					<button className='cta-button mint-button' onClick={donateAmount}>
						{`Donate ${amount} ETH & mint NFT`}
					</button>
				</div>
			</div>
		);
	}
	// Form to view NFT on OpenSea
	const renderOpenseaView = () =>{
		if (tokenViewURL.includes("rarible")) {
			return (
				<div className="form-container">
					<div className="first-row">
						<a href={tokenViewURL} target="_blank" rel="noreferrer noopener">
							View your NFT on Rarible (might take a little time): {NFTName}
						</a>
					</div>
				</div>
			);
		} else if (tokenViewURL.includes("opensea")) {
			return (
				<div className="form-container">
					<div className="first-row">
						<a href={tokenViewURL} target="_blank" rel="noreferrer noopener">
							View your NFT on OpenSea (might take a little time)
						</a>
					</div>
				</div>
			);
		}
	}

	const randomizeBg = () =>{
		const images = require.context(`./assets/images/bg/`);
		const bgIndex = Math.floor(Math.random()*images.keys().length);
		import(`./assets/images/bg/${images.keys()[bgIndex].replace('./','')}`).then(image => {
			setBg(image.default);
		});
	}

	const getTokenPrice = async(chain)=>{
		const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${chain.includes('Polygon') ? 'matic-network' : 'ethereum'}`);
		if(response.ok){
			const data = await response.json();
			setCurrentPrice(data[0].current_price || 0);
		}
	}

	useEffect(() => {
		randomizeBg();
		checkIfWalletIsConnected();
	}, []);

	return (
		<div className="App">
			<div className="container" style={{background: `url(${bg}) 50% 50% /cover #000000`}}>
				<div className="header-container">
					<header>
						<div className="left">
							<a className="main-logo" href="/">
								<img className="main-logo-img" src={logo} alt="Ukraine Art Collective"/>
							{/*	<img className="main-logo-img-text" src={logoText} href="https://ukraineartco.org" target="_blank" alt="Ukraine Art Collective"/> */}
							</a>
						</div>
						<div className="right">
							<img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
							{ currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
						</div>				
					</header>							
				</div>
				<div className="center">
						<div className="title"><p className="blue">Ukraine</p><p className="yellow">Art</p><p className="yellow">Collective</p></div>
						<p className="subtitle">Harnessing global creative power to support the Ukrainian people. When you donate, you get an NFT created by Ukrainian artists. We appreciate donation of any amount, with recommended minimum of 0.01 ETH</p>
						{/* Hide the connect button if currentAccount isn't empty*/}
						{!currentAccount && renderNotConnectedContainer()}
						{currentAccount && renderWhenWalletConnected()}
						<p className="description"> Net proceeds will be donated directly to <a href="https://razomforukraine.org/" target="_blank" rel="noreferrer">Razom</a> a US registed 501(c)(3) organization supporting the Ukrainian people's dreams of building a free, prosperous, and independent European nation.</p>
						<div className="social">
							<a className="social-link" target="_blank" rel="noreferrer" href="https://twitter.com/UkraineArtCo">
								<img className="social-link-img" src={twitterLogo} alt="twitter"/>
							</a>
							<a className="social-link" target="_blank" rel="noreferrer" href="https://www.instagram.com/UkraineArtCo">
								<img className="social-link-img" src={instagramLogo} alt="instagram"/>
							</a>
							<a className="social-link" target="_blank" rel="noreferrer" href="https://www.facebook.com/UkraineArtCo">
								<img className="social-link-img" src={faceboookLogo} alt="facebook"/>
							</a>
							<a className="social-link" target="_blank" rel="noreferrer" href="https://www.tiktok.com/@UkraineArtCo">
								<img className="social-link-img" src={tiktokLogo} alt="tiktok"/>
							</a>
						</div>
						<a href="https://github.com/ukraineartco/" target="_blank" rel="noreferrer" className="github-link">
							See our contract on GitHub
						</a>
					</div>
				{errorMessage && 
				(<p className="isa_error"> {errorMessage} </p>)}

			</div>
		</div>
		
	);
};

export default App;
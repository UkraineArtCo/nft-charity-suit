import FormData from 'form-data';
import axios from 'axios';
import * as fs from 'fs';

import * as dotenv from "dotenv";
dotenv.config();

async function main() {

    // initialize the form data
    const formData = new FormData()

    // append the file form data to 
    // formData.append("file", fs.createReadStream('./src/store/SaveUkraine_NFT_2.png'));
    formData.append("file", fs.createReadStream('./src/store/1.png'));

    // call the keys from .env
    const API_KEY = process.env.REACT_APP_PIN_API_KEY
    const API_SECRET = process.env.REACT_APP_PIN_API_SECRET
    console.log("KEYS:", API_KEY, API_SECRET);

    // the endpoint needed to upload the file
    const url =  `https://api.pinata.cloud/pinning/pinFileToIPFS`

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
    console.log("response:", response.data.IpfsHash);

}

main().catch((error) => {
console.error(error);
process.exitCode = 1;
});
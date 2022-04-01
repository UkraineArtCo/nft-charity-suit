import fs from 'fs'


async function main() {
    const receiptFileData = await fs.promises.readFile("receipt.json")
    const receipt = JSON.parse(receiptFileData);

    console.log("receipt:", receipt, typeof(receipt));
    for (var ie = 0; ie < receipt["events"].length; ie++) {
        if (receipt["events"][ie]["event"] === "MarketItemSold") {
            console.log("tokenID", receipt["events"][ie]["args"][0]["hex"], parseInt(receipt["events"][ie]["args"][0]["hex"], 16));
        }
    }
}

main()
.catch(err => {
    console.error(err)
    process.exit(1)
})
# ODIN Web Wallet Proof of Concept

## Requirements
* NodeJS >= 8.0

## Setup
1) Download `odinjs-lib` [Link](https://github.com/Manbearpixel/odinjs-lib)
2) Switch to that directory and run `npm link`
3) Download `webwallet` [Link](https://github.com/Manbearpixel/odin-webwallet-poc)
4) Switch to that directory and run `npm link odinjs-lib`
5) Install other dependencies for this project with `npm install`
6) Run the web wallet with `npm run start`

## Send Transaction
1) Load `http://localhost:4000/send`
2) Select as many `unspent` transactions as needed to match or exceed ODIN to send
3) Input an ODIN address
4) Enter an amount of ODIN to send
5) Click `Send Transaction`

#### Notes
Change will be automatically calculated based on the sum of unspent transactions _(inputs)_, amount of ODIN to be sent, and the fixed fee. This change is sent back to the original address the transaction is made from.

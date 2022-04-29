'use strict';

const fs = require('fs/promises');
const fetch = require('node-fetch');
const ethers = require('ethers');
const pMap = require('p-map');

const ENS_CONTRACT = '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85';
const TOKEN_IDS = 'https://raw.githubusercontent.com/implementcollective/10kclub-utils/main/token-ids.json'
const ETHERSCAN_KEY = 'YOU_API_KEY';
const EHTERSCAN_URL = 'http://api.etherscan.io/api?module=contract&action=getabi&address=' + ENS_CONTRACT;
const MY_ID = '90189362340486413291294039646849563756813736977408559890121254376144397471744';

const tokenIds = require('./token-ids.json');

async function main() {
    const contractABI = await fetch(EHTERSCAN_URL)
		.then(res => res.json())
		.then(res => res.result)
		.then(JSON.parse);
  
    if (contractABI != '') {
		const provider = ethers.providers.getDefaultProvider('homestead', {
			etherscan: ETHERSCAN_KEY
		});
		const contract = new ethers.Contract(ENS_CONTRACT, contractABI, provider);
		const errored = {};
		const holders = {};
		
		const mapper = async (digit) => {
			const tokenId = data[digit];
			
			try {
				console.log(digit);
				const owner = await contract.ownerOf(tokenId);
				holders[owner] = holders[owner] || { digits: [], ids: [], owner };
				holders[owner].digits.push(digit);
				holders[owner].ids.push(tokenId);
				//console.log(digit, tokenId, owner);
			} catch (e) {
				//console.log('err id:', digit, tokenId);
				errored[digit] = tokenId;
			}
		};
		
		await pMap(Object.keys(tokenIds), mapper, {concurrency: 500});
		console.log('holders', errored, holders);
		console.log('errored', Object.keys(errored).length);
		console.log('holders count', Object.keys(holders).length);
		
		await fs.writeFile('./holders.json', JSON.stringify(holders, null, 2));
		await fs.writeFile('./errored.json', JSON.stringify(errored, null, 2));
    }
}

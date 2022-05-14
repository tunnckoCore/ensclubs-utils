'use strict';

const pMap = require('p-each-series');
const utils = require('./index.js');

async function main() {
	const { provider, contract } = utils.prepareSetup();
	
	/*
	await utils.getHolders(utils.generate0x2digitsClubInfo());
	*/
	
	console.log('Generating snapshots for clubs:', JSON.stringify(utils.CLUBS, null, 2));
	console.log('');
	
	//console.log(utils.getInfoForLabel('10970'))
	await pMap(utils.CLUBS, mapper, {concurrency: 5});
	
	async function mapper(clubName) {
		console.log('Generating', clubName, 'snapshot');
		const data = await utils.getHolders(utils[`generate${clubName}ClubInfo`](), {
			delay: null, log: true, concurrency: 50,
			provider, contract, clubName,
		});
		const res = await utils.writeHolders(data, clubName);
		
		console.log('Snapshot', res.filepath, 'created');
		return res
	}
}

main().then(() => process.exit(0)).catch(console.error);

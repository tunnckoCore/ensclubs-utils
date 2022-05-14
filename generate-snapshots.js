'use strict';

const pMap = require('p-map');
const utils = require('./index.js');

async function main() {
	
	/*
	await utils.getHolders(utils.generate0x2digitsClubInfo());
	*/
	
	console.log('Generating snapshots for clubs:', JSON.stringify(utils.CLUBS, null, 2));
	console.log('');
	
	//console.log(utils.getInfoForLabel('10970'))
	await pMap(utils.CLUBS, mapper, {concurrency: 30});
	
	async function mapper(clubName) {
		console.log('Generating', clubName, 'snapshot');
		const data = await utils.getHolders(utils[`generate${clubName}ClubInfo`](), {log:true, concurrency: 1000});
		const res = await utils.writeHolders(data, clubName);
		
		console.log('Snapshot', res.filepath, 'created');
		return res
	}
}

main().catch(console.error);

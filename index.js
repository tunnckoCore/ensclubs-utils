'use strict';

const sha = require('js-sha3').keccak_256;
const fs = require('fs/promises');
const fetch = require('node-fetch');
const ethers = require('ethers');
const pMap = require('p-map');
const CONTRACT_ABI = require('./contract-abi.json');

const ENS_CONTRACT = '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85';
const TOKEN_IDS = 'https://raw.githubusercontent.com/implementcollective/10kclub-utils/main/token-ids.json'
const ETHERSCAN_KEY = 'XXX';
const ALCHEMY_KEY = 'XXX';
const EHTERSCAN_URL = 'http://api.etherscan.io/api?module=contract&action=getabi&address=' + ENS_CONTRACT;
const MY_ID = '90189362340486413291294039646849563756813736977408559890121254376144397471744';

const CLUBS = [
	'0xN',
	'2digitHyphens',
	'3digits',
	'0x2digits',
	'4digitDates',
	'4digitHours',
	'24h',
	'4digits',
	'0x3digits',
	'0x4digits',
	//'5digits',
];
exports.CLUBS = CLUBS;
exports.EHTERSCAN_URL = EHTERSCAN_URL;
exports.ENS_CONTRACT = ENS_CONTRACT;

exports.getInfoForLabel = getInfoForLabel;
function getInfoForLabel(label) {
	const _label = String(label).replace('.eth', '');
	const labelHash = sha(_label);
	
	return {
		id: ethers.BigNumber.from('0x' + labelHash).toString(),
		label: _label,
		name: _label + '.eth',
		hash: labelHash,
		hex: '0x' + labelHash
	};
}

exports.generateClub = generateClub;
function generateClub(options) {
	const opts = { prefix: '', pad: 4, start: 0, end: 10000, type: 'label', ...options }
	const result = {};
	
	for (let idx = opts.start; idx < opts.end; idx++) {
		const str = String(idx);
		let key = opts.pad > 0 ? str.padStart(opts.pad, '0') : str;
		
		// 4-digit hours (0000-2359), 1440 supply
		// 24h Club (00h00-23h59), 1440 supply
		if (opts.isHours || opts.is24h) {
			const minute = key.slice(2);
			if (Number(minute) > 59) {
				continue;
			}
			
			key = opts.is24h ? key.slice(0, 2) + 'h' + minute : key;
		}
		
		// 4-digit-dates (supports only MMDD, 366 supply),
		// or hyphens
		if (opts.isDates || opts.isHyphens) {
			const _left = key.slice(0, opts.isHyphens ? 1 : 2);
			const _right = key.slice(opts.isHyphens ? 1 : 2);
			const left = Number(_left);
			const right = Number(_right);
			const shorterMonths = [4,6,9,11];
			
			if (opts.isDates) {
				if (left > 12 || right > 31 || right == 0 || (left == 2 && right > 29) || shorterMonths.includes(left) && right > 30) {
					continue;
				}
			}
			
			// 2-digit hyphens club (0-0, 9-4, 2-2, etc)
			if (opts.isHyphens && (left > 9 || right > 9)) {
				continue;
			}
			if (opts.isHyphens) {
				key = left + '-' + right;
			}
		}
		
		const tokenInfo = getInfoForLabel(opts.prefix + key);
		
		if (opts.type === 'all') {
			result.id = result.id || {};
			result.label = result.label || {};
			result.name = result.name || {};
			result.hash = result.hash || {};
			result.hex = result.hex || {};
			
			result.id[tokenInfo.id] = tokenInfo;
			result.label[tokenInfo.label] = tokenInfo;
			result.name[tokenInfo.name] = tokenInfo;
			result.hash[tokenInfo.hash] = tokenInfo;
			result.hex[tokenInfo.hex] = tokenInfo;
		} else {
			result[tokenInfo[opts.type]] = tokenInfo;
		}
	}
	
	return result;
}

exports.generate3digitsClubInfo = generate3digitsClubInfo;
function generate3digitsClubInfo(options) {
	return generateClub({ ...options, end: 1000, pad: 3 })
}

exports.generate4digitsClubInfo = generate4digitsClubInfo;
function generate4digitsClubInfo(options) {
	return generateClub({ ...options, end: 10000, pad: 4 })
}

exports.generate5digitsClubInfo = generate5digitsClubInfo;
function generate5digitsClubInfo(options) {
	return generateClub({ ...options, end: 100000, pad: 5 })
}

exports.generate0xDigitsClubInfo = generate0xDigitsClubInfo;
function generate0xDigitsClubInfo(options) {
	return generateClub({ start: 0, end: 100, pad: 2, ...options, prefix: '0x' })
}

exports.generate0xNClubInfo = generate0xNClubInfo;
function generate0xNClubInfo() {
	return generate0xDigitsClubInfo({ pad: 0, end: 10 });
}

exports.generate0x2digitsClubInfo = generate0x2digitsClubInfo;
function generate0x2digitsClubInfo(options) {
	return generate0xDigitsClubInfo(options)
}

exports.generate0x3digitsClubInfo = generate0x3digitsClubInfo;
function generate0x3digitsClubInfo() {
	return generate0xDigitsClubInfo({ end: 1000, pad: 3 })
}

exports.generate0x4digitsClubInfo = generate0x4digitsClubInfo;
function generate0x4digitsClubInfo() {
	return generate0xDigitsClubInfo({ end: 10000, pad: 4 })
}

exports.generate4digitHoursClubInfo = generate4digitHoursClubInfo;
function generate4digitHoursClubInfo() {
	return generateClub({ pad: 4, end: 2360, isHours: true, is24h: false });
}

exports.generate4digitDatesClubInfo = generate4digitDatesClubInfo;
function generate4digitDatesClubInfo() {
	return generateClub({ pad: 4, start: 100, end: 1232, isDates: true });
}

exports.generate24hClubInfo = generate24hClubInfo;
function generate24hClubInfo() {
	return generateClub({ pad: 4, end: 2360, is24h: true });
}

exports.generate2digitHyphensClubInfo = generate2digitHyphensClubInfo;
function generate2digitHyphensClubInfo() {
	return generateClub({ isHyphens: true, pad: 2, end: 100 })
}




exports.prepareSetup = prepareSetup;
function prepareSetup(options) {
	const provider = ethers.getDefaultProvider('homestead', {
		alchemy: ALCHEMY_KEY,
		etherscan: ETHERSCAN_KEY,
		...options
	});
	const contract = new ethers.Contract(ENS_CONTRACT, CONTRACT_ABI, provider);
	
	return { provider, contract };
}

exports.getHolders = getHolders;
async function getHolders(info, options) {		
	const opts = {log: false, ...options}
	const timestamp = Date.now();
	const date = new Date(timestamp);

	if (opts.delay) {
		await require('timers/promises').setTimeout(opts.delay);
	}
	
	const { provider, contract } = opts;
	const result = { holders: {}, expired: {}, labels: {} };
	
	const mapper = async (key, idx) => {
		
		await require('timers/promises').setTimeout(1000);
		
		const tokenInfo = info[key];
		
		result.labels[key] = tokenInfo;
		
		try {
			//opts.log && console.log(key);
			const owner = await contract.ownerOf(tokenInfo.id);
			opts.log && console.log(tokenInfo.name, owner, clubName);
			
			// by owner
			result.holders[owner] = result.holders[owner] || { labels: [], ids: [], owner };
			result.holders[owner].labels.push(key);
			result.holders[owner].ids.push(tokenInfo.id);
			
			// by label
			result.labels[key].owner = owner;
		} catch (e) {
			if (e && e.message.includes('revert')) {
				opts.log && console.log('expired:', key);
			} else {
				e && opts.log && console.log('error:', key, e);
			}
			
			// console.log('err id:', digit, tokenId);
			// errors if ENS domain is expired and is in grace period,
			// and we don't have a way to get the current/previous owner
			result.expired[key] = tokenInfo;
		}
	};
	
	await pMap(Object.keys(info), mapper, opts);
	
	result.timestamp = timestamp;
	result.date = date;
	result.holdersCount = Object.keys(result.holders).length;
	result.expiredCount = Object.keys(result.expired).length;
	result.supply = Object.keys(result.labels).length;
	
	opts.log && console.log('expired count', result.expiredCount);
	opts.log && console.log('holders count', result.holdersCount);
	opts.log && console.log('supply count', result.supply);
	
	return result;

}

exports.writeHolders = writeHolders;
async function writeHolders(result, club) {
	const date = new Date(result.timestamp).toISOString().slice(0, 10);
	const dir = `./snapshots/${date}`;
	const filepath = `${dir}/${club}.json`
	
	result.club = club;
	await fs.mkdir(dir, {recursive: true});
	await fs.writeFile(filepath, JSON.stringify(result, null, 2));
	return {...result, dir, filepath};
}

// tunnckocore = 28497337018786134763379290050653770564449704201052612624656628776993509337486	
// 1001 = 44075751628062706675479954522231874821678107550657036164932206545166956041440
// 8352 = 26657115892874964014209039774973514451193548564577596411733116917379283263521
// 1024 = 18753002961840764934639144233306154392438302189984775373834635167494265763662

/*
getHolders(generate3digitsClubInfo())
	.then(res => writeHolders(res, '3digits').then(() => console.log('3digits club snapshot ready')))
	.then(() => getHolders(generate0xDigitsClubInfo()))
	.then(res => writeHolders(res, '0x2digits').then(() => console.log('0x2digits club snapshot ready')))
	.then(() => getHolders(generate24hClubInfo()))
	.then(res => writeHolders(res, '24hours').then(() => console.log('24hours club snapshot ready')))
	.then(() => getHolders(generateHoursClubInfo()))
	.then(res => writeHolders(res, '4digit-hours').then(() => console.log('4digit-hours club snapshot ready')))
	.then(() => getHolders(generate4digitsClubInfo()))
	.then(res => writeHolders(res, '4digits').then(() => console.log('4digits club snapshot ready')))
	.then(() => getHolders(generate5digitsClubInfo()))
	.then(res => writeHolders(res, '5digits').then(() => console.log('5digits club snapshot ready')))


getHolders(generateClub({isHyphens: true, pad: 2, end: 100})).then(res => writeHolders(res, '2digit-hyphens'))
*/
	
/*//getHolders(generate4digitsClubInfo()).then(res => writeHolders(res, '4digits'));
//getHolders(generate5digitsClubInfo()).then(res => writeHolders(res, '5digits'));
//getHolders(generate0xDigitsClubInfo()).then(res => writeHolders(res, '0x2digits'));
//getHolders(generateHoursClubInfo()).then(res => writeHolders(res, '4digit-hours'));
//getHolders(generate24hClubInfo()).then(res => writeHolders(res, '24h'));*/


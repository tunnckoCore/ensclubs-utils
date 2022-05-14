'use strict';

const _0xN = require('./snapshots/2022-05-14/0xN.json').labels;
const _0x2digits = require('./snapshots/2022-05-14/0x2digits.json').labels;
const _0x3digits = require('./snapshots/2022-05-14/0x3digits.json').labels;
const _0x4digits = require('./snapshots/2022-05-14/0x4digits.json').labels;
const _24hours = require('./snapshots/2022-05-14/24hours.json').labels;
const _3digits = require('./snapshots/2022-05-14/3digits.json').labels;
const _4digits = require('./snapshots/2022-05-14/4digits.json').labels;


function labelsTo(clubs, key = 'id') {
	const res = {};
	
	clubs.forEach((club) => {
		Object.keys(club).forEach((label) => {
			const val = club[label][key];
			
			// label-to-x
			res[label] = val;
			
			// x-to-label
			//res[val] = res[val] || [];
			//res[val].push(label)
		});
	});
	
	return res;
}

const clubs = [
	_0xN,
	_0x2digits,
	_0x3digits,
	_0x4digits,
	_24hours,
	_3digits,
	_4digits
]

//console.log(Object.keys(labelsTo(clubs, 'owner')).length)
//console.log(JSON.stringify(labelsTo(clubs, 'owner'), null, 2))

'use strict';

const fs = require('fs');
const _0xN = require('./snapshots/2022-05-14/0xN.json').labels;
const _0x2digits = require('./snapshots/2022-05-14/0x2digits.json').labels;
const _0x3digits = require('./snapshots/2022-05-14/0x3digits.json').labels;
const _0x4digits = require('./snapshots/2022-05-14/0x4digits.json').labels;
const _24hours = require('./snapshots/2022-05-14/24hours.json').labels;
const _2digitHyphens = require('./snapshots/2022-05-14/2digit-hyphens.json').labels;
const _3digits = require('./snapshots/2022-05-14/3digits.json').labels;
const _4digits = require('./snapshots/2022-05-14/4digits.json').labels;


function labelsTo(clubs, key = 'id', reverse) {
	const res = {};
	
	clubs.forEach((club) => {
		Object.keys(club).forEach((label) => {
			const val = club[label][key];
			
			if (reverse) {
				// x-to-label
				res[val] = res[val] || [];
				res[val].push(label)
			} else {
				// label-to-x
				res[label] = val;
			}
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
	_2digitHyphens,
	_3digits,
	_4digits
];

const date = new Date(Date.now()).toISOString().slice(0, 10);
const dir = './snapshots/' + date + '/';

fs.writeFileSync(dir + 'labels-to-ids.json', JSON.stringify(labelsTo(clubs, 'id'), null, 2));
fs.writeFileSync(dir + 'labels-to-owners.json', JSON.stringify(labelsTo(clubs, 'owner'), null, 2));
fs.writeFileSync(dir + 'owners-to-labels.json', JSON.stringify(labelsTo(clubs, 'owner', true), null, 2));

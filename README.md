# ens utils & helpers

### Notes

It may not work for you, because I modified the `node_modules` files of `p-map` and other Sindre Sorhus packages.

I'm intentionally using require, for now.

I don't have dev setup here, it was a frickin nightmare of 12 hours with no auto-complation, no syntax highlighting, and etc.
I don't usually write such bad code and without any linters or formatters. That's probably the first since never.

```
# generates and writes each from CLUBS variable (inside index.js)
node generate-snapshots.js

# makes a bit different json mappings
node map-labels.js
```

**Check `owners-to-labels.json`:** it lists what ens clubs each owner holds, this 2nd one on the picture holds:

- 0x2digits
- 10k 3digit
- 10k 4digit

![image](https://user-images.githubusercontent.com/5038030/168429704-9a59f6de-64b9-4337-8a78-a4e2f6f1e8ca.png)


### Descriptions

**Club Names**

Every ENS-specific category/club has name. It's not exactly how they are officially, at least for now. It's for APIs and computers.

That's the "club names"

```
0xN = 0x0, 0x2, 0x7, etc

# hyphENS
2digitHyphens = L-L hyphENS (will be renamed to NNhyphens)

NNhyphens = Number-Number hyphENS, 1-2, 1-1, 5-9, etc
LLhyphens = Letter-Letter, a-o, a-q, w-b, etc
NLhyphens = Number-Letter, f-2, x-8, etc
LNhyphens = Letter-Number, 1-f, 7-s, etc

# 0x10kClub
0x2digits = 0x00-0x99
0x3digits = 0x000-0x999
0x4digits = 0x0000-0x9999

# 10kClub, 3 and 4 digits
3digits = 000-0x999
4digits = 0000-0x9999
5digits = 00000-0x99999
4digitHours = 0000-2359, without those above 59; 0114, 2105, etc
4digitDates = 0101-1231, only MMDD format supported for now

# 24hClub, 5-character hours
24h = 00h00-23h59

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
```

**adding other clubs**

- add your club name to `const CLUBS`, camelCased.
- add `generate<clubName>ClubInfo` function and export it through `exports`
- it should return and object like `{ 'ensdomain': getInfoForLabel('ensdomain') }` which holds all the supply
- **that's it!** use `getHolders`, `writeHolders` as shown below

**Methods**

#### generate\*ClubInfo
So, for each club and the future ones, the is exposed method with the following pattern `generate<clubName>ClubInfo`

These methods are used to generate a structure of key value pairs between the "label" (ie, the ens domain without the `.eth`), and the corresponding on-chain tokenId, its hash and etc.

```js
const utils = require('./ensclubs-utils/index.js');

console.log(utils.generate3digitsClubInfo());
console.log(utils.generate24hClubInfo());

// for now, will be changed soon
console.log(utils.generate2digitHyphensClubInfo());
```

Why is that? Because we later use the real actual tokenIds, so we can ask the ENS Contract who's the owner/holder of that tokenId/domain.

#### getHolders(info, options)

This accepts an object that is returns from the `generate*ClubInfo` methods, and returns all the owners their labels, names, tokenIds, and etc. This result object is bigger, intentionally because we later can make smaller pieces for what we need by just importing the snapshot.

For example, for generating current snapshot for your favorite club do something like below.
Or look at `generate-snapshots` where we just automate everything with loops, so we don't have repeating code.

```js
const utils = require('./ensclubs-utils/index.js');
const { provider, contract } = utils.prepareSetup()

const 5digits = utils.generate5digitsClubInfo();

const promise = getHolders(5digits, { log: true, concurrency: 50, provider, contract });

promise.then((data) => utils.writeHolders(data, '5digits'));
```

Keep in mind, that it will always override the existing files on the current date's folder.

#### writeHolders(data, clubName)

This one is easy. The `clubName` can be anything, it just will be the file inside the `snapshots/YYYY-MM-DD/<clubName>.json`

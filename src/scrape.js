const theirtube = require('./theirtube.js');

// Get accounts
// N.B. This file does (of course) not exist in the repo, create your own :)
// See README for formatting requirements
const accounts = require('../secret/accounts-2-backup.json');

scrapeAll();

async function scrapeAll() {
    // Check if we have a valid accounts array
    if(accounts && accounts.accounts && accounts.accounts.length > -1) {
        await accounts.accounts.reduce(async (memo, account) => {
            await memo;
            await theirtube.backup(account);
            await theirtube.initialize(false);
            await theirtube.login(account);
            await theirtube.scrape(account, false);
            await theirtube.end();
        }, undefined);
    }
}
const theirtube = require('./theirtube.js');

// TO DO: secure this better
// Get accounts
const accounts = require('../secret/accounts.json');

scrapeAll();

function scrapeAll() {
    // Check if we have a valid accounts array
    if(accounts && accounts.accounts && accounts.accounts.length > -1) {
        // If so, run the scripts for each account in the array
        accounts.accounts.forEach(async (account, index) => {
            await theirtube.initialize();
            await theirtube.login(account);
            await theirtube.scrape(account);
            await theirtube.end();
        });
    }
}
const theirtube = require('./theirtube.js');
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv;

// Get accounts
// N.B. This file does (of course) not exist in the repo, create your own :)
// See README for formatting requirements
const accounts = require('../secret/accounts.json');

if (argv.name) {
    console.log(`Will now watch the playlist for account ${argv.name}`);

    // Check if accounts array is correct
    if(accounts && accounts.accounts && accounts.accounts.length > -1) {
        let account = accounts.accounts.find(a => a.nickname === argv.name);
        watch(account);
    } else {
        console.log('Missing or incorrectly formatted accounts array!')
    }

} else {
    console.log('Missing arguments, make sure to provide a --name argument!');
}

async function watch(account) {
    // Check if have both an account and playlist url
    if (account && account.playlist) {
        await theirtube.initialize(true);
        await theirtube.goToPlaylist(account.playlist);
        await theirtube.login(account);
        await theirtube.playAndstayAwake();
    } else {
        console.log('No proper account name given or account does not have playlist, account', account);
    }
}
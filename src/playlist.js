const theirtube = require('./theirtube.js');
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv;

// TO DO: secure this better
// Get accounts
const accounts = require('../secret/accounts.json');

if (argv.name && argv.playlist) {
    console.log(`Will now watch playlist ${argv.playlist} on account ${argv.name}`);

    // Check if accounts array is correct
    if(accounts && accounts.accounts && accounts.accounts.length > -1) {
        let account = accounts.accounts.find(a => a.nickname === argv.name);
        watch(account, argv.playlist);
    } else {
        console.log('Missing or incorrectly formatted accounts array!')
    }

} else {
    console.log('Missing arguments, make sure to provide a --name and --playlist argument!');
}

async function watch(account, playlist) {
    // Check if have both an account and playlist url
    if (account && playlist) {
        await theirtube.initialize();
        await theirtube.goToPlaylist(playlist);
        await theirtube.login(account);
        await theirtube.playAndstayAwake();
        await theirtube.end();
    } else {
        console.log('No proper account name or playlist given, account', account, 'playlist', playlist);
    }
}
const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const path = require('path');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

const chalk = require('chalk');
const BASE_URL = 'https://www.youtube.nl/';
const dayjs = require('dayjs');
const serverFolderPath = 'pointer-dev.kro-ncrv.nl/data/theirtube'

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin());


// Set variables
let browser = null;
let page = null;

// TO DO: secure this in a better way
const accounts = require('../secret/accounts.json');

const theirtube = {

    backup: async (account) => {
        if(account && account.nickname) {
            console.log('Backing up json for ', account.nickname);

            //Set json backup directory and make one if it does not exist
            let json_dir = path.join(__dirname, `../json/${account.nickname}`);
            let json_backup_dir = path.join(__dirname, `../json/${account.nickname}/backups`);
            if (!fs.existsSync(json_backup_dir)) {
                fs.mkdirSync(json_backup_dir);
            }

            // Then backup file
            let today = dayjs().format('DD-MM-YYYY-HH:mm');
            fs.copyFile(`${json_dir}/videos.json`, `${json_backup_dir}/videos-${today}.json`, (err) => {
                if (err) throw err;
                console.log(`Backup for ${account.nickname} was successful!`);
            });

        } else {
            console.log('No account name to backup, are you sure your account info is correct?');
        }

    },

    initialize: async () => {
        browser = await puppeteer.launch({
            headless: true,
            devtools: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu'
            ]
        });

        page = await browser.newPage();

        await page.setViewport({
            width: 2000,
            height: 1000,
        });

        console.log(await browser.userAgent());
        await page.goto(BASE_URL);
        console.log(chalk.black.bgCyanBright(' Initialized, Going to —>" + BASE_URL'));
    },

    login: async (account) => {
        if (account && account.username) {
            console.log(`Signing in ${account.username}`);

            // Wait for two seconds, allow pop-up to appear if needed
            // But have two scenarios, one with and one without the pop-up. You never know
            await page.waitFor(2000);

            if (await page.$('yt-upsell-dialog-renderer paper-button.style-suggestive') !== null) {
                console.log('Has inlog dialog, going through with inlog dialog selector');
                await page.waitFor('yt-upsell-dialog-renderer paper-button.style-suggestive');
                console.log("Click sign-in button");
                await page.click('yt-upsell-dialog-renderer paper-button.style-suggestive');
            } else {
                console.log('No login dialog, use top right inlog button');
                await page.waitFor('ytd-masthead paper-button.style-suggestive');
                console.log("Click sign-in button");
                await page.click('ytd-masthead paper-button.style-suggestive');
            }

            // Now proceed to actual log-in, typing username
            await page.waitFor(500);
            await page.waitForSelector('#identifierId');
            await page.type('#identifierId', account.username, {delay: 70});
            console.log('Typing in the users name...');

            //Clicking the Next button
            await page.waitFor(500);
            await page.waitForSelector('#identifierNext');
            await page.click('#identifierNext');
            console.log('Clicking the Next button...');

            //Type in the password, wait 2 seconds since form take while to load
            console.log('Typing in the password...');
            await page.waitFor(2500);
            await page.waitForSelector('#password');
            await page.type('#password', account.pass, {delay: 80});

            //Sending the Password
            await page.waitFor(500);
            await page.waitForSelector('#passwordNext');
            await page.click('#passwordNext');
            console.log('🖱 :Clicking the Send password button...');

        } else {
            console.log('Could not sign in, are you sure your account info (for this account) is complete?');
        }
    },

    scrape: async (account) => {
        // Await the content
        await page.waitFor("#content");
        console.log("🔨 Scraper Starting for : " + account.nickname + " ——— waiting 5 seconds " + '\n');
        await page.waitFor(5000);

        //generating DD-MM-YY sequence name for the folder.
        let today = dayjs().format('DD-MM-YYYY-HH:mm');

        //$$ works exactly as a document.querySelectorAll() would in the browser console
        let videoArray = await page.$$('#content > .ytd-rich-item-renderer');
        let videos = [];

        // A bit old-fashioned, but the modular structure $$ provides here is worth it;
        let videoAmount = 8;
        let currentParsed = 0;

        for (let videoElement of videoArray) {
            if(currentParsed < videoAmount + 1) {
                let video = {};
                let youtube_url = "https://www.youtube.com";

                // This is a bit repetitive, but allows for better logging
                try {
                    if (videoElement) {
                        video.title = await videoElement.$eval('yt-formatted-string', element => element.innerText);
                    }
                } catch (e) {
                    console.log("Could not scrape video title" + e);
                }

                try {
                    if (videoElement) {
                        video.url = await videoElement.$eval('a', element => element.getAttribute('href'));
                        video.url = youtube_url.concat(video.url);
                    }
                } catch (e) {
                    console.log("Could not scrape video url" + e);
                }

                try {
                    if (videoElement) {
                        video.channel = await videoElement.$eval('ytd-channel-name', element => element.innerText);
                        video.channel_url = await videoElement.$eval('ytd-channel-name a', element => element.href);
                        video.channel_icon = await videoElement.$eval('#avatar-link yt-img-shadow img', element => element.src);
                    }
                } catch (e) {
                    console.log("Could not scrape channel info, " + e);
                }

                try {
                    if (videoElement) {
                        video.thumbnail = await videoElement.$eval('ytd-thumbnail yt-img-shadow img', element => element.src);
                        video.viewnum = await videoElement.$eval('#metadata-line span', element => element.innerText);
                        video.date = await videoElement.$eval('#metadata-line', element => element.innerText);
                        video.date = video.date.split("\n")[2];
                    }
                } catch (e) {
                    console.log("Could not scrape video metadata" + e);
                }

                if(video.title && video.channel) {
                    currentParsed++;
                    videos.push(video);
                }
            }
        }

        //Set json directory and make one (including empty json file) if it does not exist
        let json_dir = path.join(__dirname, `../json/${account.nickname}`);
        if (!fs.existsSync(json_dir)){
            fs.mkdirSync(json_dir);
            fs.writeFileSync(`${json_dir}/videos.json`, JSON.stringify([]))
        }

        //Reading the JSON files and converting them into JSON format
        const dataBuffer = fs.readFileSync(`${json_dir}/videos.json`);
        const dataJson = dataBuffer.toString();
        const data = JSON.parse(dataJson);

        // TO DO: back up old data

        // check if data is valid array and push new data to it
        if(data && data.length > -1) {
            let newData = {
                timeStamp: dayjs(),
                dateTime: dayjs().format('DD/MM/YYYY, HH:mm:ss'),
                screenshotPath: `${serverFolderPath}/screenshots/${account.nickname}/${today}.jpg`,
                account: account.nickname,
                videos: videos
            };

            data.push(newData);
        }

        //write files to the system
        fs.writeFile(`${json_dir}/videos.json`, JSON.stringify(data), (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log(chalk.black.bgYellowBright('💾 The file has been saved!' + '\n'));
            }
        });

        //Set screenshot directory and make one if it does not exist
        let screenshot_dir = path.join(__dirname, `../screenshots/${account.nickname}`);
        if (!fs.existsSync(screenshot_dir)){
            fs.mkdirSync(screenshot_dir);
        }

        //make a photo based on the iteraction count
        let SCREENSHOT_PATH = path.join(__dirname, `../screenshots/${account.nickname}/${today}.jpg`);
        await page.screenshot({path: SCREENSHOT_PATH});
    },

    goToPlaylist: async (playlistUrl) => {
        await page.goto(playlistUrl);
        await page.waitForSelector('.ytd-playlist-video-thumbnail-renderer');
        await page.click('ytd-playlist-video-thumbnail-renderer');
    },

    playAndstayAwake: async () => {
        await page.waitFor(2000);
        await page.waitForSelector('.ytp-cued-thumbnail-overlay');
        await page.click('.ytp-cued-thumbnail-overlay');

        await page.setRequestInterception(true);

        // page.on('request', request => {
        //     if (request.isNavigationRequest()) {
        //         console.log('NAV >>', request.method(), request.url())
        //     } else {
        //         console.log('NORMAL >>', request.method(), request.url())
        //     }
        // });

        // await page.waitFor(300000);
        console.log('End of playlist reached, ending script...');
    },

    end: async () => {
        await browser.close();
    }

}

module.exports = theirtube;

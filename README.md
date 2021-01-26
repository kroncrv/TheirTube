

# TheirTube - KRONCRV version

Theirtube is a Youtube filter bubble simulator that provides a look into how videos are recommended on other people's YouTube.  🔗[their.tube](https://www.their.tube). 

At KRO-NCRV we used it for an article about political profiling on Youtube. We extended functionality to automatically feed profiles with playlists, auto-watching of recommendations and seperate logging. This app runs headlessly, which means it can run on a VPS.

## Installation

The main dependancy of theirtube is [puppeteer](https://github.com/puppeteer/puppeteer) ver 2.1.1,  [node-schedule](https://www.npmjs.com/package/node-schedule) ver 1.3.2 running on node.js ver 12

Installation is easy, just ```npm install``` or ```yarn``` and it installs the dependencies.

Accounts need to be created by hand in a ```secret``` folder in the root directory. Please create an ```accounts.json``` in that folder with the following structure:

```
{
    "accounts": [
        {
            "username": "youruser@gmail.com",
            "nickname": "profile1",
            "pass": "password1"
        },
        {
            "username": "youruser2@gmail.com",
            "nickname": "profile2",
            "pass": "password2"
        }
    ]
}

```

Please do not commit that folder in your repo. Just don't. 

## Usage

Unlike the original theirtube, we do not provide automated scheduling. You can use CI, cronjobs or other automation tools to schedule your scrapes.

Run ```yarn scrape``` to run a basic scrape. A screenshot will be saved in the ```screenshots``` folder in the root directory, in the ```json``` directory (also in the root), your json files will be saved. Every scrape makes a back-up of the previous one.

You *can* run the scraper in non-headless mode, by setting the one parameter to false in ```await theirtube.initialize(true)```. The scraper automatically watches the first video as well. To disable this, set the second parameter to false in ```await theirtube.scrape(account, true)```.

To feed your account a playlist, use the ```yarn playlist``` command. It takes to arguments, the nickname of your account and the url to your playlist, like so:

```yarn playlist --name="account1" --playlist="https://www.youtube.com/playlist?list=PLteGGGFYdh9HKVJLW9uGxIcaagsmyOZs-"```

N.B.: Use the original playlist view url, not a url of (one of the videos). Let the command run as long as needed, it will automatically close at the end of the playlist. It will log an awful lot.



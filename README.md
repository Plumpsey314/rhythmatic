# Rhythmatic

# Basic instructions:

To install the project write git clone "THE PROJECT LINK" (specific link to be found on GitHub).
This will create a new folder with the project contents as a subfolder of the directory you typed this command into.
You should see a message in the console saying: 
cloning into rhythmatic
Go into the rhythmatic folder created via git clone by typing: 
cd rhythmatic
You are now in the project root folder.
Make sure to run all console commands described in the README in this folder.4

Create a new file called .env.local
This has very important, and secret information(AKA jumbled numbers and letters) you will need to run the project.Due to the
importance of the security of this file it is not on GitHub and needs to be added manually.
To get the contents of this file, let Cooper Saye or Nathan Derhake know.

To pull up the terminal, if you are in VSCode press 
"ctrl+`" You will see some tabs such as PROBLEMS, OUTPUT, or TERMINAL. Make sure you are in the TERMINAL tab.

To install the dependencies needed to run the project:
1. Make sure you have a version of npm make sure you have Node installed from here: https://nodejs.org/en/download/
 Here is a tutorial: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm 
2. run npm install in the project root folder.

To run the code start the server by typing in the console
npm run dev 

and go to  http://localhost:3000
(you might need to wait about 20 seconds and refresh the page before you see the server pop up)

There will be text in the console with details about what is going on in the local server that is useful for debugging.

To stop the server, press
"ctrl+C" twice. Make sure you click onto the console first or else VSCode will think you are just copying something.

Always make sure to save the changes you make in a file or else they will not take effect in your server.
The server automatically refreshes upon changes (provided you save them), so you should see them imidiately. You can always try refreshing the page or restarting the server if you think your changes are not

To pull changes from github type in the console
git pull
and type 
npm install
in the console to install any new dependencies

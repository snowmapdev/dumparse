"use strict";
//Written in 2025
Object.defineProperty(exports, "__esModule", { value: true });
//this one has no error handling but its way faster lol
//importing required node.js functions
var fs_1 = require("fs");
var fs = require('fs');
var es = require('stream');
var rl = require('readline');
//create an in and out stream and an interface to read line by line and print the data
var instream = fs.createReadStream('gabawaba');
var outstream = new es();
var readline = rl.createInterface(instream, outstream);
var article = {}; //need to grab data from a wikipedia article and slap it in this object, then print this object out to a new page
var isInPage = false; // Flag to track if we are inside a <page> block
var pageContent = '';
var articleTitle = '';
var maxArticleTitleLength = 180; //should be 255 but we need the .md and initial path
var lineCount = 1;
var articleCount = 0;
var articleDirectoryCount = 1;
var regex = /[#^\[\]|\\/:]/g; //wild regex to remove illegal characters in filename for obsidian
console.log('Processing Wikipedia XML dump...');
readline.on('line', function (line) {
    if (line.includes('<page>')) {
        isInPage = true; // Set the flag to true
        pageContent = ''; // Reset the content variable for a new <page> block
    }
    if (line.includes('<title>') && !line.includes('Wikipedia:WikiProject Spam/LinkReports')) {
        articleCount++;
        articleTitle = line.slice(11, -8); //slice the first 11 chars and last 8 chars to grab only the title
        articleTitle = articleTitle.replace(regex, '-');
        articleTitle = articleTitle.substring(0, maxArticleTitleLength);
        if (articleCount % 10000000 === 0) { //if the articles reaches 10 milly add one to the directory count so a new directory gets made
            articleDirectoryCount++;
        }
    }
    else {
        isInPage = false; // Set the flag to true
    }
    if (isInPage == true) {
        pageContent += line + '\n'; // Append the current line with a newline
    }
    if (line.includes('</page>')) {
        isInPage = false; // Reset the flag as the block ends
        if (!fs.existsSync('/home/dev/dumparse/wikidump/articles' + articleDirectoryCount)) {
            fs.mkdirSync('/home/dev/dumparse/wikidump/articles' + articleDirectoryCount, { recursive: true });
            console.log('Created new subdirectory: articles' + articleDirectoryCount);
        }
        console.log('Line: ' + lineCount + '   Article: ' + articleCount + '   Title: ' + articleTitle);
        try {
            fs_1.promises.writeFile('/home/dev/dumparse/wikidump/articles' + articleDirectoryCount + '/' + articleTitle + '.md', pageContent, {
                flag: "w"
            }).then(function () {
            });
        }
        catch (err) {
            console.error('Error on line' + lineCount + 'processing article: ' + articleTitle);
            console.error(err);
        }
    }
    //console.log("Line: " + lineCount);
    lineCount++;
});
readline.on('close', function () {
    console.log("Dump parsing complete!");
});

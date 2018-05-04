const _ = require("lodash");
const Youch = require('youch');
const chalk = require("chalk");
const readline = require("readline");
const YouchTerminal = require('youch-terminal');
const { Observable, fromEvent, timer } = require("rxjs");
const { takeUntil, race, filter, take, tap, last, skip } = require("rxjs/operators");

/**
 * Compute histogram for the characters in the given
 * collection of characters (string).
 * 
 * @param {Array<string>} chars 
 */
function charHistogram(chars) {
    chars = chars.toLowerCase();
    const histogram = new Array(26).fill(0);
    const startCharCode = "a".charCodeAt(0);
    
    for (let i = 0; i < chars.length; i++) {
        let cc = chars.charCodeAt(i) - startCharCode;
        
        histogram[cc]++;
    }
    
    return histogram;
}

/**
 * Check if the given `target` string  has contains an
 * annagram for the `source` string.
 * 
 * @param {String} source Original string for reference
 * @param {String} target A string to be checked for match
 */
function isNearAnagram(source, target) {
    const sourceHistogram = charHistogram(source);
    const targetHistogram = charHistogram(target);
    
    return sourceHistogram.every((count, i) => {
        return targetHistogram[i] >= count;
    });
}

/**
 * Decode (destructure) a given message used to attack
 * kingdoms into:
 * 
 * 1. Kingdom's name
 * 2. Attack vector (message used as weapon to attack kingdom)
 * 
 * @param {String} message 
 * 
 * @returns {Object<name, weapon>}
 * 
 * @throws if message is invalid
 */
function decodeAttackMessage(message) {
    const matches = /(.*), "(.*)"/.exec(message);
    
    if (matches && matches.length === 3) {
        const [full, name, weapon] = matches;
        
        return { name, weapon };
    }

    throw new Error(
        `InvalidArgumentException: [${message}] is not a valid attack message`
    );
}

/**
 * Start a readline session and return the observable
 * clients can subscribe to.
 * 
 * @param {String} prompt 
 */
function readLine(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    
    const source = fromEvent(rl, "line");
    const end = fromEvent(rl, "close");
    const emptyLine = source.pipe(filter(_.isEmpty));
    
    return source.pipe(
        takeUntil(end),
        takeUntil(emptyLine),
    );
}

/**
 * Report a given Error beautifully, using the Youch
 * reporter extension.
 * 
 * @param {Error} error 
 */
function ouch(error) {
    return new Youch(error, {}).toJSON().then((output) => {
        console.log(YouchTerminal(output))
    })
}

/**
 * Add padding to given string so that is shows up at the
 * center of the output.
 * 
 * @param {String} str 
 */
function center(str, print = false) {
    let w = process.stdout.columns;
    
    str = _.pad(str, w <= 130 ? w-2 : w/2)

    print && zero(str)

    return str;
}

/**
 * Display a message as heading.
 * 
 * @param {String} message 
 */
function heading(message, style = "white.bgGreen.bold") {
    style = _.get(chalk, style, chalk.white)

    console.log('\n' + style(center(message)) + '\n');
}

function list(lines) {
    const w = center('').length;
    const avg = _.maxBy(lines, 'length').length;

    lines = lines.map(line => ' '.repeat(Math.abs(Math.floor(w/2 - avg/2))) + line)
    
    console.log(lines.join('\n'));
}

/**
 * Validate if the given path is a module that exists.
 * 
 * @param {String} path 
 * 
 * @throws if the module does not exist
 */
function validate(path) {
    const fs = require('fs')
    
    if ( !fs.existsSync(path)) {
        throw new Error(`Heyy ! I am sure you mean well, but, "${path}" does not exist.`)
    }

    return true;
}

/**
 * Start the application.
 * 
 * @param {String} path Path to module that you wish to boot
 */
function boot(path) {
    (async (m) => await (new m()).start())(require(path));
}

/**
 * Used as error handler function for uncaught exceptions.
 * 
 * @param {Error} err The uncaught error
 */
function uncaught(err) {    
    ouch(err).then(() => process.exit(1))
}

/**
 * Clear the line, move cursor to start of the line. And
 * write the message, if one is passed.
 * 
 * @param {String} message 
 */
function zero(message = null) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    if (message) {
        process.stdout.write(message);
    }
}

/**
 * Start a countdown.
 * 
 * @param {Number} seconds 
 * @param {String} message 
 */
function countdown(seconds, message = false) {
    return timer(0, 1000).pipe(
        take(seconds+1),
        tap(elapsed => message && zero(`${message} : ${seconds-elapsed} seconds`)),
        last(),
        tap(done => zero()),
    ).toPromise().then(_.noop)
}

/**
 * Generate a pseudo random string of given length.
 * 
 * @param {Number} length Length of the generated string
 */
function strRand(length = _.random(10, 30)) {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz     ";

    return (new Array(length))
        .map(() => possible.charAt(_.random(0, possible.length)))
        .join();
}

module.exports = {

    // app helpers
    ouch, boot, uncaught, validate,

    // domain helpers
    isNearAnagram, decodeAttackMessage, strRand,
    
    // cli helpers
    readLine, countdown,
    
    // cli styling helpers
    center, heading, zero, list
};

const Common = require('./src/common')

/**
 * Some magic, required to display beautify errors 
 * in the terminal, that is, if someone f's up !
 */
process.on('uncaughtException', Common.uncaught)
process.on('unhandledRejection', Common.uncaught)

/**
 * Illuminate !
 * 
 * To make things, we are going to have this file as the entry.
 * What that means, is, when we want to run a challenge, we
 * can just do `node index.js One` and it does a little
 * magic dust and runs us the first challenge for us. 
 * 
 * Run directly:
 *  - node index.js One
 * or
 *  - node index.js Two
 * 
 * Run via npm:
 *  - npm run one
 * or
 *  - npm run two
 * 
 * @author Kuldeep Anand <iam@kuldeepanand.com> 
 */
const name = process.argv[2];
const path = `${__dirname}/src/Challenge/${name}.js`;

Common.validate(path) && Common.boot(path)
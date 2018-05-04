const _ = require("lodash");
const chalk = require("chalk");
const Common = require("../common");
const DataSet = require('./DataSet');
const Kingdom = require('./Kingdom');
const { filter, partition, tap, map } = require("rxjs/operators");

class Message extends DataSet {
    static ask() {
        Message.showInputBeginMessage()
        
        const [valid, invalid] = Common.readLine().pipe(
            map(z => z.trim()),
            map(Message.optionals),
            partition(Message.isValidAttack)
        );

        invalid.subscribe(Message.showBadLineError);

        return valid.pipe(
            tap(z => Common.zero('\nnext > ')),
            map(Common.decodeAttackMessage)
        );
    }

    static optionals(input) {
        if (['--valid', '-V'].includes(input)) {
            return Message.any();
        }

        if (['--random', '-R'].includes(input)) {
            return Message.randomAttackVector();
        }
        
        return input;
    }

    static randomAttackVector() {
        const name = Kingdom.any().name
        const message = Common.strRand();
        
        return `${name}, "${message}"`;
    }

    static isValidAttack(attack) {
        return attack.match(/(.*), ?"(.*)?"/);
    }

    static showInputBeginMessage() {
        Common.heading('Attack Vector Transmission Begin');

        Common.list([
            'Here are few guidelines to help you input attack vectors.',
            '• Only valid inputs like ' +chalk.cyan(Message.any())+ ' are accepted.',
            '• Input a random messages use --random or -R',
            '• Input a random '+chalk.green('valid')+' messages use --valid or -V',
            '• Use [CTRL] + [D] combo to end the transmission.',
            '• You can also put in an empty line to end the transmission.'
        ]);

        Common.zero('\nstart > ')
    }
    
    static showInputEndMessage() {
        // console.log(chalk.green.bold(Common.center('THE END')))
    }
    
    static showBadLineError(line) {
        const m = '\nOops! %s is an invalid attack msg. Try something like:';
        
        console.log(m, chalk.red(line), chalk.cyan(Message.any()));

        Common.zero('\nretry > ')
    }
}

module.exports = Message;
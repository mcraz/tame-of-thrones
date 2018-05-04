const _ = require("lodash");
const chalk = require("chalk");
const Common = require("../common");
const { Kingdom, Message } = require("../Data");
const { take, toPromise, first } = require("rxjs/operators");

/**
 * 
 * ~ Breaker of Chains ~
 * 
 * ------------------------------------------------------------------
 * 
 * The other kingdoms in the Universe also yearn to be the ruler of 
 * Southeros and war is imminent! The High Priest of Southeros 
 * intervenes and is trying hard to avoid a war and he 
 * suggests a ballot system to decide the ruler. 
 * 
 * Coding challenge is to help the High Priest choose the ruler of 
 * Southeros through the ballot system.
 * 
 * @author Kuldeep Anand <iam@kuldeepanand.com>
 * @see https://www.geektrust.in/api/pdf/open/PS5
 */
class Two {

    /**
     * Create a new instance of the Two class.
     */
    constructor() {
        // Track the number of rematches that have been played.
        // This is used when we want to break the rematch
        // routing because of too many rematches.
        this.rematchCount = 0;
    }

    /**
     * Start the game.
     * 
     * Get participants, start let the fight begin.
     */
    async start() {
        const participants = await this.readParticipats();

        await this.fight(participants);
    }

    /** 
     * We will start by getting all kingdoms to attach each
     * other. Then compute the winner. If we have multiple
     * winners, i.e a tie, we will attempt to break the
     * tie with a rematch between the tied kingdoms.
     * 
     * @param {Array<String>} participants Names of participating kingdoms
     */
    async fight(participants) {
        const kingdoms = participants.map(name => {
            return Kingdom.firstOrFail('name', name)
        })

        for (let kingdom of kingdoms) {
            this.attack(kingdom, kingdoms);
        }

        const winner = this.winner(kingdoms);
        const rematch = this.isTie(winner);

        this.stats(kingdoms, rematch);
        
        if (rematch) {
            return await this.rematch(winner);
        }

        this.winnerStat(winner[0]) || process.exit(0);
    }

    async rematch(winner) {
        this.rematchCount++

        if (this.rematchCount > 3) {
            throw new Error('No more than 3 rematches are allowed. All loose !');
        }

        const names = _.map(winner, 'name');
        const message = 'Starting rematch for ' + names.join(', ');
        
        console.log();
        
        await Common.countdown(5, message)

        await this.fight(names)
    }

    attack(sender, kingdoms) {
        const others = _.filter(kingdoms, (kingdom) => {
            return kingdom.name !== sender.name && _.isEmpty(kingdom.allyTo);
        });

        for (let receiver of others) {
            this.attempt(sender, receiver);
        }
    }

    attempt(sender, receiver) {
        const weapons = Message.any(6, 'messageTwo');

        sender.attack(receiver, ...weapons);
    }

    async readParticipats() {
        // For purposes of testing , uncomment the next 2 lines.
        // It will choose random kingdoms to play the game.
        // console.log('Choosing random kingdoms. To deactivate: Two.readParticipants()')
        // return Kingdom.any(_.random(1, 6)).map(k => k.name);
        
        Common.heading('Breaker of Chains')

        Common.zero('Enter the kingdoms competing to be the ruler (ex: air space land)\n');
        Common.zero('> ');
        
        return await Common.readLine()
            .pipe(first())
            .toPromise()
            .then(i => i.split(' '));
    }

    winner(kingdoms) {
        const groups = _.groupBy(kingdoms, k => k.allies.length)
        const max = _.max(_.keys(groups).map(parseFloat))

        return groups[max];
    }

    isTie(winner) {
        return winner.length > 1
    }

    stats(kingdoms, isRematch = false) {
        isRematch 
            ? Common.heading("Intrim Results • " + chalk.red('Rematch Pending'))
            : Common.heading("Results")
     
        for (let kingdom of kingdoms) {
            console.log('=> %s : %s', kingdom.name, kingdom.allies.length);
        }
    }

    winnerStat(kingdom) {
        console.log('\nWho is the ruler of Southeros ?');
        console.log(kingdom.name);
        
        console.log('\nAllies of Ruler ?');
        console.log(_.map(kingdom.allies, 'name').sort().join(', '));
    }
}

module.exports = Two;
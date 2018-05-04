const _ = require("lodash");
const Common = require("../common");
const { Kingdom, Message } = require("../Data");

/**
 * 
 * ~ A golden crown ~
 * 
 * ------------------------------------------------------------------
 * 
 * There is no ruler in the universe of Southeros and pandemonium 
 * reigns. Shan, the gorilla king of the Space kingdom wants to 
 * rule all Six Kingdoms in the universe of Southeros. 
 * 
 * He needs the support of 3 more kingdoms to be the ruler.
 * 
 * @author Kuldeep Anand <iam@kuldeepanand.com>
 * @see https://www.geektrust.in/api/pdf/open/PS5
 */
class One {

    /**
     * Find Player 1's kingdom and report initial 
     * status for the war to console. 
     * 
     * Also, let the record state that there 
     * no king of Southeros
     * 
     * And, some stats, before the game.
     */
    constructor() {
        this.p1 = Kingdom.firstOrFail("name", "space");
        this.ruler = null;

        this.stats();
    }
    

    /**
     * We *ask* the user to input the kingdom to attack, with
     * a messages (aka attack vector). For each, we try
     * to attack the said kingdom using the attack 
     * vector.
     * 
     * When the user is done playing we stop the game and show
     * stats for the played game.
     */
    async start() {
        const input$ = Message.ask()

        input$.subscribe(
            
            next => this.attack(next),

            errr => Common.ouch(errr),
            
            done => this.stats() > process.exit(0)

        )
    }
    
    /**
     * Attack the said kingdom. For every win, we add them
     * as our ally and move to next.
     * 
     * Also, when the number of allies become 3, we declare 
     * said player as the of Southero.
     * 
     * @param {Object<name, weapon>}
     */
    attack({ name, weapon }) {
        const opponent = Kingdom.firstOrFail("name", name);
        
        if ( !this.p1.hasWon(opponent)) {
            this.p1.attack(opponent, weapon);
        }

        if (this.p1.allies.length === 3) {
            this.ruler = this.p1;
        }
    }

    /**
     * Show statistics of the played game. Name of the ruler
     * and it's allies.
     */
    stats() {
        Common.heading('Game Stats');

        const king = _.get(this.ruler, 'name', 'None')
        const allies = this.ruler 
            ? _.map(this.ruler.allies, 'name').join(', ')
            : "None"
            
        console.log('Who is the ruler of Southeros?\n', king)
        console.log('Allies of Ruler?\n', allies)
    }
}

module.exports = One;
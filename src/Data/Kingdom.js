const DataSet = require('./DataSet');
const Common = require("../common");

class Kingdom extends DataSet {
  constructor({ name, emblem }) {
    super();

    this.name = name;
    this.emblem = emblem;
    this.allies = [];
    this.allyTo = [];
  }

  /**
   * Check if the given string contains letters 
   * from the emblem
   * 
   * @param {String} weapon 
   */
  isVulnerableTo(weapon) {
    return Common.isNearAnagram(this.emblem, weapon);
  }

  /**
   * Check if the asked kingdom can be won with any of the
   * supplied weapons by the host. If we can, mark them
   * as an ally to us.
   * 
   * @param {Kingdom} kingdom 
   * @param {Array<String>} weapons 
   */
  attack(kingdom, ...weapons) {
    const canBeWon = weapons.some(w => kingdom.isVulnerableTo(w))
    
    if (canBeWon) {
      kingdom.allyTo.push(this);
      this.allies.push(kingdom);
    }

    return this;
  }

  hasWon(kingdom) {
    return this.allies.some(s => kingdom.name === s.name);
  }
}

module.exports = Kingdom;
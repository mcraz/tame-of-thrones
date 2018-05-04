const _ = require('lodash');

class DataSet {
    static collectionName(name = null) {
        if (name) {
            return name;
        }

        return this.name.toLowerCase();
    }

    static all(db = null) {
        const name = this.collectionName(db);

        const data = require('./db/' + name)

        return data.slice();
    }

    static each(cb) {
        this.all().forEach(cb)
    }

    static any(howMany = null, db = null) {
        if (null === howMany)
            return _.sample(this.all(db))

        return _.sampleSize(this.all(db), howMany);
    }

    static firstOrFail(key, value) {
        value = value.toUpperCase();
        
        for (let current of this.all()) {
            if (current[key] === value) {
                return new this(current);
            }
        }
        
        throw new Error(
            `KingdomNotFound: A ${this.name} with [${key}] = [${value}] could not be found`
        );
    }
}

module.exports = DataSet;
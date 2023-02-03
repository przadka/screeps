/**
 * Trying to separater tower code into a module...
 * 
 */

var towerStructure = {

    /** @param {Structure} tower **/
    run: function (tower) {

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        if (closestHostile) {
            tower.attack(closestHostile);
        } else {

            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.hits < structure.hitsMax) && (structure.hits > 0) &&
                        (structure.structureType == STRUCTURE_ROAD))
                }
            });

            let damaged_roads = tower.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.hits < structure.hitsMax) && (structure.hits > 0) &&
                        (structure.structureType == STRUCTURE_ROAD))
                }
            });

            let damaged_walls = tower.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.hits < 200000) && (structure.hits > 0) &&
                        (structure.structureType == STRUCTURE_WALL))
                }
            });

            let closest_damaged = tower.pos.findClosestByRange(_.merge(damaged_roads, damaged_walls));

            //only if energy is above>xx
            if (closest_damaged && (tower.store.getUsedCapacity(RESOURCE_ENERGY) / tower.store.getCapacity(RESOURCE_ENERGY) > 0.6)) {
                tower.repair(closest_damaged);
            }
        }



    }
};



module.exports = towerStructure;

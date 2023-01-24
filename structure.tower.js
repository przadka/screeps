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
        }

            

            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.hits < structure.hitsMax) && (structure.hits > 0) &&
                            structure.structureType == STRUCTURE_ROAD)
                    }
                });


            //only if energy is above>xx
            if(closestDamagedStructure && (tower.store.getUsedCapacity(RESOURCE_ENERGY)/tower.store.getCapacity(RESOURCE_ENERGY)>0.5)) {
                tower.repair(closestDamagedStructure);
            }
    
    

    }
};



module.exports = towerStructure;

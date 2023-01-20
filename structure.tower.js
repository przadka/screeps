/**
 * Trying to separater tower code into a module...
 * 
 */

var tower = {

    /** @param {Structure} tower **/
    run: function (tower) {

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        if (closestHostile) {
            tower.attack(closestHostile);
        }

            /*

            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, 0{
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
    
    
        }
    */


    }
};



module.exports = tower;

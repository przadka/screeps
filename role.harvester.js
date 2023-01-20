/**
 * Harvester is the simplest crip role that tries to get some 
 * energy directly from the source. It's small and versatile -
 * can supply energy to many diffent targets. It will get energy from 
 * a random energy source. Not very efficient. 
 * 
 */

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.store.getFreeCapacity() > 0) {
            //still some capacity left, try to fill

            var sources = creep.room.find(FIND_SOURCES);

            var dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (r) => r.resourceType == RESOURCE_ENERGY && r.amount >= 150
            });


            if (dropped.length > 0) {
                //if there is anything dropped - pick it
                var dropped_closest = creep.pos.findClosestByPath(dropped);

                if (creep.pickup(dropped_closest) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropped_closest, { visualizePathStyle: { stroke: '#ffaa00' } });
                }

            } else {
                //if there is no dropped then just try to harvest normal sources
                if (creep.memory.assignment === undefined || creep.memory.assignment == 0) {
                    //pick random source
                    var r = Math.round(Math.random() * (sources.length - 1));
                    creep.memory.assignment = sources[r].id;
                }

                var my_source = Game.getObjectById(creep.memory.assignment);

                if (creep.harvest(my_source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(my_source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }

        }
        else {

            //harvesters should really just focus on extension probably
            //towers maybe
            //everthing else should be covered by haulers or other creeps
            //and harvester need to make sure we can respawn these bigger creeps
            //if we need to

            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_STORAGE ||
                        structure.structureType == STRUCTURE_TOWER)
                        &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                }
            });

            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                //move somwhere?
                creep.say('nothing to do');

            }
        }
    }
};

module.exports = roleHarvester;

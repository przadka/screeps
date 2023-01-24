var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 collect');
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        }
        else {

            //i should also use link
            /*
            var sources = creep.room.find(FIND_STRUCTURES, { 
                filter: (structure) => { 
                    return (((structure.structureType == STRUCTURE_STORAGE)
                    || (structure.structureType == STRUCTURE_CONTAINER))  && 
                    structure.store[RESOURCE_ENERGY] > 0)
                }
             });
             */

            //decide dynamically what source of energy to use
            //if storage or links exists - pick these randomly
            //and ignore containers
            //if only containers exist - use them
            //worst case - go to source directly

            var s_storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_STORAGE) &&
                        structure.store[RESOURCE_ENERGY] > 0)
                }
            });

            var s_containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_CONTAINER) &&
                        structure.store[RESOURCE_ENERGY] > 0)
                }
            });

            var s_link = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_LINK) &&
                        structure.store[RESOURCE_ENERGY] > 0 &&
                        structure.pos.getRangeTo(structure.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return ((structure.structureType == STRUCTURE_STORAGE))
                            }
                        })) < 5) // this only return links that are close to storage
                }
            });


            //TODO i should dynamically decide which source to use
            //only use links if storeage and containers are not there
            //TODO i should use links or containers here?
            var source = creep.pos.findClosestByPath(_.merge(s_storage, s_link));

            //find fullest source and use it?

            if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};

module.exports = roleUpgrader;
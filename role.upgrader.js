/**
 * Upgrader takes care of upgrading the controller in the room.
 * It picks the energy from available source/storage and bring
 * it to the room controller upgrading it.
 */

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

            var s_storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_STORAGE) &&
                        structure.store[RESOURCE_ENERGY] > 0)
                }
            });

            var s_links = creep.room.find(FIND_STRUCTURES, {
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

            var my_source = null;

            if (_.size(s_storage) > 0 || _.size(s_links) > 0) {
                //storage or links 
                my_source = creep.pos.findClosestByPath(_.merge(s_storage, s_links));
                if (creep.withdraw(my_source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(my_source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                //otherwise just harvest energy sources directly
                my_source = creep.pos.findClosestByPath(creep.room.find(FIND_SOURCES));
                if (creep.harvest(my_source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(my_source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        }
    }
};

module.exports = roleUpgrader;
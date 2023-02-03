/**
 * Upgrader takes care of upgrading the controller in the room.
 * It picks the energy from available source/storage and bring
 * it to the room controller upgrading it.
 * 
 */

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep) {


        //if full and i should be working in another room - exit
        if ((creep.store.getFreeCapacity() == 0) &&
            (creep.memory.target != undefined) && (creep.room.name != creep.memory.target)) {
            //find exit to the target room

            let exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByRange(exit));
            return; //refactor?
        }

        //if empty and my base is in a differnet room, go to base to fillu up
        if ((creep.store[RESOURCE_ENERGY] == 0) &&
            (creep.memory.base != undefined) && (creep.room.name != creep.memory.base)) {
            //find exit to the base room

            let exit = creep.room.findExitTo(creep.memory.base);
            creep.moveTo(creep.pos.findClosestByRange(exit));
            return; //refactor?
        }


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

            var s_stores = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_STORAGE
                        || structure.structureType == STRUCTURE_CONTAINER) &&
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


            let my_source = null;

            if (_.size(s_stores) > 0 || _.size(s_links) > 0) {
                //storage or links 
                my_source = creep.pos.findClosestByPath(_.merge(s_stores, s_links));
                if (creep.withdraw(my_source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(my_source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {

                //check if there is anything dropped nearby


                let dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
                    filter: (r) => r.resourceType == RESOURCE_ENERGY && r.amount >= 150
                        && r.pos.getRangeTo(creep) < 5
                });


                if (dropped.length > 0) {
                    //if there is anything dropped - pick it
                    let my_source = creep.pos.findClosestByPath(dropped);

                    if (creep.pickup(my_source) == ERR_NOT_IN_RANGE) {
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
    }
};

module.exports = roleUpgrader;
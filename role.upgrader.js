var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 collect');
	    }
	    if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            
            var sources = creep.room.find(FIND_STRUCTURES, { 
                filter: (structure) => { 
                    return (((structure.structureType == STRUCTURE_STORAGE)
                    || (structure.structureType == STRUCTURE_CONTAINER))  && 
                    structure.store[RESOURCE_ENERGY] > 0)
                }
             });
            
             var source = creep.pos.findClosestByPath(sources);
             //if i just upgraded the controller, i will use the closed source
             //which most likely will be the storage

            if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
	}
};

module.exports = roleUpgrader;
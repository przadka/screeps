var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.store.getFreeCapacity() > 0) {
            
            var sources = creep.room.find(FIND_SOURCES);
            if (creep.memory.assignment === undefined || creep.memory.assignment == 0) {
                //need to find my source
                var r  =  Math.round(Math.random() * (sources.length-1));
                creep.memory.assignment = sources[r].id;
            }

            var my_source = Game.getObjectById(creep.memory.assignment);

            if(creep.harvest(my_source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(my_source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER ||
                                structure.structureType == STRUCTURE_STORAGE) && 
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};

module.exports = roleHarvester;

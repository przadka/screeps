var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
	        creep.memory.repairing = true;
	        creep.say('🚧 repair');
	    }

	    if(creep.memory.repairing) {

			var r_roads = creep.room.find(FIND_STRUCTURES, { 
				filter: (structure) => { 
					return ((structure.hits < 5000) && (structure.hits > 0) &&
					structure.structureType == STRUCTURE_ROAD)
				}
			 });

			 var r_extenstions = creep.room.find(FIND_STRUCTURES, { 
				filter: (structure) => { 
					return ((structure.hits < 1000) && (structure.hits > 0) &&
					structure.structureType == STRUCTURE_EXTENSION)
				}
			 });

			 var r_walls = creep.room.find(FIND_STRUCTURES, { 
				filter: (structure) => { 
					return ((structure.hits < 10000) && (structure.hits > 0) &&
					structure.structureType == STRUCTURE_WALL)
				}
			 });

			var repairs = _.merge(r_extenstions, 
				r_roads, r_walls);

			if (repairs.length>0) {
				var repair = creep.pos.findClosestByPath(repairs);
				if(creep.repair(repair) == ERR_NOT_IN_RANGE) {
					creep.moveTo(repair, {visualizePathStyle: {stroke: '#ffffff'}});
				}
			} else {
				//nothing to repair, where should i move?
				console.log("nothing to repair");
			}
	    }
	    else {
	        var sources = creep.room.find(FIND_SOURCES);
			if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
	}
};

module.exports = roleRepairer;
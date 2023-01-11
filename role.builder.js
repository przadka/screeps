var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);

			if(targets.length>0) {
				var target = creep.pos.findClosestByPath(targets);
				if(creep.build(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
			}
			} else {
				//nothing to build, try to repair something
				var repairs = creep.room.find(FIND_STRUCTURES, { 
					filter: (structure) => { 
						return ((structure.hits < 5000) && (structure.hits > 0))
					}
				 });
	
				if (repairs.length>0) {
					var repair = creep.pos.findClosestByPath(repairs);
					if(creep.repair(repair) == ERR_NOT_IN_RANGE) {
						creep.moveTo(repair, {visualizePathStyle: {stroke: '#ffffff'}});
					}
				} else {
					//nothing to build or repair
					// go to spawn
					var targets = creep.room.find(FIND_STRUCTURES, {
                    		filter: (structure) => {
                        	return (structure.structureType == STRUCTURE_SPAWN) && 
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
							}});

						if (targets.length) {
							creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
						}
					}


			}

	    }
	    else {
			var sources = creep.room.find(FIND_STRUCTURES, { 
                filter: (structure) => { 
                    return (((structure.structureType == STRUCTURE_STORAGE))  && 
                    structure.store[RESOURCE_ENERGY] > 0)
                }
             });
            
             var source = creep.pos.findClosestByPath(sources);

            if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
	}
};

module.exports = roleBuilder;
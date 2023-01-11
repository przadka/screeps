var roleHauler = {
//TODO assigng haulers to containers

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (creep.memory.transporting && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transporting = false;
            creep.say('🔄collect');
            //assign target, which is fullest at the moment
            var containers = creep.room.find(FIND_STRUCTURES, { 
                filter: (structure) => { 
                    return ((structure.structureType == STRUCTURE_CONTAINER) && 
                    structure.store[RESOURCE_ENERGY] > 500)
                }
             });

            var fullest = containers.reduce((prev, current) => 
                (prev.store[RESOURCE_ENERGY] > current.store[RESOURCE_ENERGY]) ? prev : current);
            
            creep.memory.assignment = fullest.id;

	    }
	    if (!creep.memory.transporting && creep.store.getFreeCapacity() == 0) {
	        creep.memory.transporting = true;
	        creep.say('⚡transport');
            creep.memory.assignment = 0;
	    }

        if (creep.memory.transporting) {
         //transporting payload 
        
         var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_STORAGE
                                ) && 
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });

        if (targets.length > 0) {
            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
    }
        } else {
            //collecting payload

            var my_container = Game.getObjectById(creep.memory.assignment);

            if (my_container == null) {

                //for some reason i lost my container, assign a new one
                var containers = creep.room.find(FIND_STRUCTURES, { 
                    filter: (structure) => { 
                        return ((structure.structureType == STRUCTURE_CONTAINER) && 
                        structure.store[RESOURCE_ENERGY] > 500)
                    }
                 });
                 
                 if (containers.length > 0 ){
                    my_container = containers.reduce((prev, current) => 
                     (prev.store[RESOURCE_ENERGY] > current.store[RESOURCE_ENERGY]) ? prev : current);
                 }

            }


            if (creep.withdraw(my_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(my_container, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            
        } 

    }
        
};

module.exports = roleHauler;

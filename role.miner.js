var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');

        var containers = creep.room.find(FIND_STRUCTURES, { 
            filter: (structure) => { 
                return ((structure.structureType == STRUCTURE_CONTAINER))
            }
         });

         //ids of reserved containers
         var assignments = _.filter(_.map(miners, (miner) => miner.memory.assignment),
                                (a) => a != 0);

         var free_containers = 
         _.filter(containers, (container) => !(assignments.includes(container.id)));
        
        //booking a container and going to it
        if (free_containers.length>0) {
            creep.memory.assignment = free_containers[0].id;
        }

        if (creep.memory.assignment != 0) {

            var my_container = Game.getObjectById(creep.memory.assignment);
            if (creep.pos.getRangeTo(my_container)==0) {
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                creep.harvest(source);
            
                if (my_container.hits<200000) {
                    if ((Game.time-creep.memory.fixedContainerTime)>3000) {
                        creep.repair(my_container);
                    }
                } else {
                    creep.memory.fixedContainerTime = Game.time;
                }

            } else {
                creep.moveTo(my_container);

            }
        }
        
    }

};

module.exports = roleMiner;
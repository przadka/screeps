/**
 * Miner takes care of container mining. It will look for a free container 
 * (which should be placed close to an energy source), and keep mining to fill the container.
 * Note that the miner should not have many CARRY parts so that the harvested energy just
 * drops into the container. 
 * Miner also takes care of the assigned containers maintainance - it will fix the 
 * container whenever required. 
 * There are two variable storing the state:
 *  - assignment - id of container that miner owns.
 *  - fixedContainerTime - tick when the container was in healty condition, helps to 
 *                          track time spent on fixing the container.
 */
var roleMiner = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');

        if (creep.memory.assignment == 0) {
        //i dont have a container yet, will book

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


            if (free_containers.length > 0) {
                creep.memory.assignment = free_containers[0].id;
            } else {
                //TODO no free containers, just wait?
            }
        }
        else {
            //go to my container
            //work on my container if im already there

            var my_container = Game.getObjectById(creep.memory.assignment);
            if (creep.pos.getRangeTo(my_container) == 0) {

                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                creep.harvest(source);//assuming that there is source i can harvest

                if (my_container.hits < 200000) {
                    if ((Game.time - creep.memory.fixedContainerTime) > 3000) {
                        //if broken I will only work if it was in good condition
                        //more than 3000 ticks ago
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
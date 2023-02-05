/**
 * Miner takes care of container mining. It will look for a free container 
 * (which should be placed close to an energy or mineral source), and 
 * keep mining to fill the container.
 * Note that the miner should not have many CARRY parts so that the harvested energy just
 * drops into the container. 
 * There are two variable storing the state:
 *  - assignment - id of container that miner owns.
 */
var roleMiner = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.changeRoomsIfNeeded())
            return;

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
                var mineral = creep.pos.findClosestByPath(FIND_MINERALS);

                if (creep.pos.getRangeTo(source) < 2) {
                    creep.harvest(source);
                } else if (creep.pos.getRangeTo(mineral) < 2) {
                    creep.harvest(mineral);
                }
            } else {
                creep.moveTo(my_container);
            }
        }
    }


};

module.exports = roleMiner;

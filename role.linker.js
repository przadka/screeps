/**
 * Linker is a creep working with links. It assigns iself to a (sending) link
 * and keeps supplying energy to it. Any sending link should have one linker
 * working on it. When linker notices that the link is full, it sends
 * the energy to the target link.
 * 
 */
var roleLinker = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.changeRoomsIfNeeded())
            return;

        var linkers = _.filter(Game.creeps, (creep) => creep.memory.role == 'linker');

        var source_links = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_LINK) &&
                    structure.pos.getRangeTo(structure.pos.findClosestByRange(FIND_SOURCES)) < 3)
            }
        });

        //ids of reserved links
        //TODO there may be more than one linker working at a link!
        var assignments = _.filter(_.map(linkers, (linker) => linker.memory.assignment),
            (a) => a != 0);

        var free_links = _.filter(source_links, (link) => !(assignments.includes(link.id)));


        //check which link is close to energy source
        if (free_links.length > 0) {
            creep.memory.assignment = free_links[0].id;
        }
        if (creep.memory.assignment != 0) {

            var my_link = Game.getObjectById(creep.memory.assignment);
            if (creep.pos.getRangeTo(my_link) < 5) {
                //I am now in my working area
                //Here i will continously try to refill the link with energy
                //from the closest source

                var target_links = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_LINK) &&
                            structure.pos.getRangeTo(structure.pos.findClosestByRange(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return ((structure.structureType == STRUCTURE_STORAGE))
                                }
                            })) < 5) // this only return links that are close to storage
                    }
                });

                var target = target_links[0]; // what if there are more than one links here?


                if (creep.store.getFreeCapacity() > 0) {

                    var source = creep.pos.findClosestByPath(FIND_SOURCES);
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
                else {
                    if (creep.transfer(my_link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(my_link, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                }
                if (my_link.energy == my_link.energyCapacity) {
                    my_link.transferEnergy(target);
                }



            } else {
                creep.moveTo(my_link);
            }
        } else {
            //didnt manage to assign any container to myself, somebody else took it?
            //shall i just kill myself?
        }

    }

};

module.exports = roleLinker;
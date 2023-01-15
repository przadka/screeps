/**
 * Hauler transports energy from containers to destination.
 * It has two states: either transporting the payload
 * or collecting the payload from containers. When spawned
 * haulers start collecting (not transporting).
 * Change from collecting to transporting occurs when a hauler
 * which is collecting fills it’s capacity to full. Change
 * from transporting to collecting occurs if a transporting
 * huler is empty.
 * There are two variables desbricing hauler state:
 *  - transporting - whether it's currently transporing 
 *      collecting
 *  - assignment - containers assigned to hauler during 
 *      collecting phase (so that the hauler doesn't flick
 *      between different containers when collecting payload.)
 * 
 */
var roleHauler = {

    /** @param {Creep} creep **/
    run: function (creep) {

        //state change code - decide whether 
        //the current state should be changed

        if (!creep.memory.transporting) { //collecting state
            var my_container = Game.getObjectById(creep.memory.assignment);

            if (my_container === null) {
                //i don't have assignment
                //either I just spawned or I lost my container
                creep.memory.assignment = this.findContainer(creep).id;
                //TODO what if there is no container???
                //if i have some energy left, just start transporting whathever is left
                //...
            }

            //if full - start transporting
            if (creep.store.getFreeCapacity() == 0) {
                creep.say('⚡transport');
                creep.memory.assignment = 0;
                creep.memory.transporting = true;
            }
        } else { //transporting state
            if (creep.store[RESOURCE_ENERGY] == 0) {
                //I transported all my energy
                //start collecting
                creep.say('🔄collect');
                creep.memory.transporting = false;
                creep.memory.assignment = this.findContainer(creep).id;
                //TODO what if there is no container??? return null?
            }
        }


        //behaviour code - do whathever needs to be done
        if (creep.memory.transporting) {
            //transporting payload 

            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION
                        || structure.structureType == STRUCTURE_SPAWN
                        || structure.structureType == STRUCTURE_STORAGE
                        || structure.structureType == STRUCTURE_TOWER
                    ) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });


            //sort by capacity, trying to fill 
            //in smaller targets first

            targets = targets.sort((a, b) =>
                (a.store.getCapacity() - b.store.getCapacity()));


            if (targets.length > 0) {
                //from all targets with lowest capacity 
                //get the closest one

                var best_targets = _.filter(targets, (t) => t.store.getCapacity() == targets[0].store.getCapacity());
                var next_target = creep.pos.findClosestByPath(best_targets);;

                if (creep.transfer(next_target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(next_target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        } else {
            //collecting payload from assigned container

            var my_container = Game.getObjectById(creep.memory.assignment);
            //TODO see if there is any energy that was dropped
            // var dropeed = creep.room.find(FIND_DROPPED_RESOURCES, RESOURCE_ENERGY);

            if (creep.withdraw(my_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(my_container, { visualizePathStyle: { stroke: '#ffaa00' } });
            }

        }

    },
    /** @param {Creep} creep **/
    findContainer: function (creep) {
        //finds the fullest of all containers
        //with at least 500 energy 

        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_CONTAINER) &&
                    structure.store[RESOURCE_ENERGY] > 500)
            }
        });

        return containers.reduce((prev, current) =>
            (prev.store[RESOURCE_ENERGY] > current.store[RESOURCE_ENERGY]) ? prev : current);
    }
};

module.exports = roleHauler;

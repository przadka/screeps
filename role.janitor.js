//build or repair stuff

//if there is stuff to build, try to do that first
//otherwise - repair

//TODO should fix containers as well?
//store information about last seen healthy tick 
//for structure id - in a dictionary
//only repair if hasnt been repaired for a while



var roleJanitor = {

    /** @param {Creep} creep **/
    run: function (creep) {


        //state transitions
        if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            // i dont have energy to work anymore
            creep.memory.working = false;
        }

        if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            //i just filled my energy, so i will get to work
            creep.memory.working = true;
        }

        if (creep.memory.working) {
            var sites = creep.room.find(FIND_CONSTRUCTION_SITES);

            if (sites.length > 0) {
                //there is stuff to build
                var target = creep.pos.findClosestByPath(sites);
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }

            } else {
                //nothing to build - repair
                var repairs = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.hits < HEALTHY_STATES[structure.structureType])
                                 && (structure.hits > 0) &&
                            (structure.structureType == STRUCTURE_WALL 
                            || structure.structureType == STRUCTURE_CONTAINER
                            || structure.structureType == STRUCTURE_RAMPART )
                            )
                    }
                });
/*
                var r_containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.hits > 0) &&
                            structure.structureType == STRUCTURE_CONTAINER)
                    }
                });


                var r_walls = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.hits < 500000) && (structure.hits > 0) &&
                            structure.structureType == STRUCTURE_WALL)
                    }
                });


                var r_ramparts = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.hits < 6000000) && (structure.hits > 0) &&
                            structure.structureType == STRUCTURE_RAMPART)
                    }
                });
 */             //ramparty posortowac po tych najbardziej uszkodzonych

                repairs = _.filter(repairs, (repair) => 
                                (Game.time-getFixedTimeFor(creep, repair)) > REPAIR_COOLDOWN[repair.structureType]);

                if (repairs.length > 0) {
                    var repair = repairs[0];//creep.pos.findClosestByPath(repairs);//TODO what is better?
                    if (creep.repair(repair) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(repair, { visualizePathStyle: { stroke: '#ffffff' } });
                    } else {
                        //successfully repaired - check if finished repairing
                        //and possibly store repariedTick for this structure

                        if (repair.hits>HEALTHY_STATES[repair.structureType]) {
                            creep.memory.fixedTimes[repair.id] =  Game.time;
                        }
                    }
                } else {
                    //nothing to repair, where should i move?
                    console.log("Janitor: nothing to build or repair");
                }
            }
        }
        else {
            //dont have energy, need top up
            //TODO adjust energy source dynamically
            //depending on what available

            var s_storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_STORAGE) &&
                        structure.store[RESOURCE_ENERGY] > 0)
                }
            });

            var source = creep.pos.findClosestByPath(s_storage);

            if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};

module.exports = roleJanitor;

const HEALTHY_STATES = {
    [STRUCTURE_CONTAINER]: 200000,
    [STRUCTURE_RAMPART]: 1000000,
    [STRUCTURE_ROAD]: 5000
}

const REPAIR_COOLDOWN = {
    [STRUCTURE_CONTAINER]: 10000,
    [STRUCTURE_RAMPART]: 5000,
    [STRUCTURE_ROAD]: 10000
}

/** @param {Creep} creep, @param {Structure} structure **/
function getFixedTimeFor(creep, structure) {
    return creep.memory.fixedTimes[structure.id]===undefined?0:creep.memory.fixedTimes[structure.id];
}
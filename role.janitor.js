/**
 * Build or repair stuff. If something to be build
 * janitor will do that first. Structures maintained:
 * containers, walls, ramparts. Each structure has a target
 * healthy state and a cooldown time which needs to 
 * pass before janitor starts working on it again. At the 
 * moment cooldowns don't really work because lifespan of a 
 * single janitor is shorter than cooldown time. This should
 * be stored as a global state at shared across all janitors.
 * 
 * Can work in remote room getting it's energy from the base room.
 */

var roleJanitor = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.changeRoomsIfNeeded())
            return;

        //state transitions
        if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            // i dont have energy to work anymore
            creep.memory.working = false;
        }

        if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            //i just filled my energy, so i will get to work
            creep.memory.working = true;
            /*
            if (creep.memory.base == "E12N15") {
                if (Math.random() < 0.2) {
                    //70% probability to move to another room
                    creep.memory.target = "E12N14"; //TODO refactor
                } else if (Math.random() < 0.25) {
                    creep.memory.target = "E12N16"; //TODO refactor
                } else {
                    creep.memory.target = "E12N15"; //TODO refactor
                }
            }
            */

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
                                || structure.structureType == STRUCTURE_RAMPART)
                        )
                    }
                });


                repairs = _.filter(repairs, (repair) =>
                    (Game.time - getFixedTimeFor(creep, repair)) > REPAIR_COOLDOWN[repair.structureType]);

                if (repairs.length > 0) {
                    var repair = repairs[0];//creep.pos.findClosestByPath(repairs);//TODO what is better?
                    if (creep.repair(repair) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(repair, { visualizePathStyle: { stroke: '#ffffff' } });
                    } else {
                        //successfully repaired - check if finished repairing
                        //and possibly store repariedTick for this structure
                        if (repair.hits > HEALTHY_STATES[repair.structureType]) {
                            creep.memory.fixedTimes[repair.id] = Game.time;
                        }
                    }
                } else {
                    //nothing to repair, where should i move?
                    //console.log("Janitor: nothing to build or repair");
                    creep.moveTo(creep.room.controller);
                }
            }
        }
        else {

            //dont have energy, need top up
            //depending on what available

            if (creep.pickDroppedEnergyIfAny())
                return;

            var stores = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_STORAGE
                        || structure.structureType == STRUCTURE_CONTAINER) &&
                        structure.store[RESOURCE_ENERGY] > 0)
                }
            });

            var source = null;

            if (stores.length > 0) {
                source = creep.pos.findClosestByPath(stores)
                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                source = creep.pos.findClosestByPath(creep.room.find(FIND_SOURCES));
                if (creep.harvest(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }


        }
    }
};

module.exports = roleJanitor;

const HEALTHY_STATES = {
    [STRUCTURE_CONTAINER]: 200000,
    [STRUCTURE_WALL]: 200000,
    [STRUCTURE_RAMPART]: 5000000,
    [STRUCTURE_ROAD]: 5000
}

const REPAIR_COOLDOWN = {
    [STRUCTURE_CONTAINER]: 20000,
    [STRUCTURE_RAMPART]: 10000,
    [STRUCTURE_WALL]: 10000,
    [STRUCTURE_ROAD]: 10000
}

/** @param {Creep} creep, @param {Structure} structure **/
function getFixedTimeFor(creep, structure) {
    return creep.memory.fixedTimes[structure.id] === undefined ? 0 : creep.memory.fixedTimes[structure.id];
}
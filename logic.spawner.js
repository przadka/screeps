/**
 * Spawner manages spawning process for each tick. 
 * For a given room in analyzes the current situtaion and tries to spawn creeps
 * taking into account energy available and adjusting creep size if needed.
 * Spawner does not actually spawn anything. Instead it returns a list
 * of creeps that should be spawned.
 * 
 */

/**
 * Refactor: consolidate MaximumBody generation for different rolea
 */
var logicSpawner = {

    /** @param {Room} room **/
    /** @returns {TODO} List of creeps to be spawned represented as ...  */
    run: function (room) {

        var spawnQueue = [];
        var toSpawnCost = 0;
        var spawnable = null;


        var energyAvailable = room.energyAvailable;

        var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' &&
            creep.room == room);
        var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler' &&
            creep.room == room);
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' &&
            creep.room == room);
        var linkers = _.filter(Game.creeps, (creep) => creep.memory.role == 'linker' &&
            creep.room == room);
        var janitors = _.filter(Game.creeps, (creep) => creep.memory.role == 'janitor' &&
            creep.room == room);
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' &&
            creep.room == room);
        var soldiers = _.filter(Game.creeps, (creep) => creep.memory.role == 'soldier' &&
            creep.room == room);

        var mining_containers = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_CONTAINER) && (
                    structure.pos.getRangeTo(structure.pos.findClosestByRange(FIND_SOURCES)) < 3
                    || structure.pos.getRangeTo(structure.pos.findClosestByRange(FIND_MINERALS))))
            }
        });

        var towers = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER)
            }
        });

        var storages = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_STORAGE))
            }
        });

        var links = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_LINK))
            }
        });

        var sites = room.find(FIND_CONSTRUCTION_SITES);
        var hostiles = room.find(FIND_HOSTILE_CREEPS);

        let available = 0; //energy available for single spawning

        //Soldier

        if (hostiles.length > 0) {

            for (var i = soldiers.length; i < 3*hostiles.length; i++) {
                available = energyAvailable - toSpawnCost;
                spawnable = {
                    name: 'Soudat' + Game.time + "-" + Math.round(Math.random() * (1000)),
                    body: getMaximumBody([TOUGH, RANGED_ATTACK, ATTACK, MOVE], available),
                    initMemory: {
                        role: 'soldier',
                        target: room.name, base: room.name
                    }
                };
                toSpawnCost += calculateSpawningCost(spawnable.body);
                spawnQueue.push(spawnable);
            }
        }
        //Hauler
        //if there is at least one container in the room we need a Hauler
        //to move energy around, try to spawn big hauler if possible
        //Hauler will be first in the queue so it will have priority of
        //others

        if (mining_containers.length > 0 && haulers.length == 0) {

            available = energyAvailable - toSpawnCost;

            spawnable = {
                name: 'Haurry' + Game.time + "-" + Math.round(Math.random() * (1000)),
                body: getMaximumBody([CARRY, CARRY, MOVE], available),
                initMemory: {
                    role: 'hauler',
                    target: room.name, base: room.name,
                    transporting: false,
                    payload: RESOURCE_ENERGY,
                    assignment: 0
                }
            };
            toSpawnCost += calculateSpawningCost(spawnable.body);
            spawnQueue.push(spawnable);
        }

        //Harvester
        //small and cheap, always can be spawned TODO TODO
        //if Hauler is operating we don't need Harvesters
        //otherwise we should spawn 2xenergy sources of Harvesters?

        //if there are conditions for Hauler to operate than 2 is enough (maybe 1 per energy resource)
        //if Hauler condition are not met (ie. no containers presents)
        //then spawn 2 additional Harvesters

        //if we have conainers then we SHOULD have 
        //Hauler operating, so no need to Harvesters


        if (storages.length == 0) {


            //2 basic Harvesters should be operating 
            //if there is no storeage operated by Hauler
            for (var i = harvesters.length; i < 2; i++) {
                available = energyAvailable - toSpawnCost;
                spawnable = {
                    name: 'Harvey' + Game.time + "-" + Math.round(Math.random() * (1000)),
                    body: getMaximumBody([WORK, CARRY, MOVE], available),
                    initMemory: { role: 'harvester', assignment: 0, resourceCarried: 0,
                    target: room.name, base: room.name }
                };

                toSpawnCost += calculateSpawningCost(spawnable.body);
                spawnQueue.push(spawnable);
            }
        }


        //Linker
        //linker works with lins to send energy between them
        //only needed if links are present
        if (links.length >= 2) {
            for (var i = linkers.length; i < Math.floor(links.length / 2); i++) {

                spawnable = {
                    name: 'Linny' + Game.time + "-" + Math.round(Math.random() * (1000)),
                    body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
                    initMemory: { role: 'linker', assignment: 0 }
                };

                toSpawnCost += calculateSpawningCost(spawnable.body);
                spawnQueue.push(spawnable);
            }
        }

        //Miners
        //TODO adjust size depending on energy avaiable?
        for (var i = miners.length; i < mining_containers.length; i++) {
            spawnable = {
                name: 'Minero' + Game.time + "-" + Math.round(Math.random() * (1000)),
                body: [WORK, WORK, WORK, WORK, WORK, MOVE],
                initMemory: { role: 'miner', assignment: 0, }
            };

            toSpawnCost += calculateSpawningCost(spawnable.body);
            spawnQueue.push(spawnable);
        }

        //Janitors - adjust size dynamically

        let j_needed = 2;

        if (towers.length > 0 && sites.length == 0) {
            j_needed = 1; //one janitor to fix containers?
        }

        for (var i = janitors.length; i < j_needed; i++) {

            available = energyAvailable - toSpawnCost;
            spawnable = {
                name: 'JayJay' + Game.time + "-" + Math.round(Math.random() * (1000)),
                body: getMaximumBody([WORK, CARRY, MOVE], available),
                initMemory: {
                    role: 'janitor', fixedTimes: {},
                    target: room.name, base: room.name
                }
            };
            toSpawnCost += calculateSpawningCost(spawnable.body);
            spawnQueue.push(spawnable);
        }


        //Upgraders

        for (var i = upgraders.length; i < 1; i++) {

            available = energyAvailable - toSpawnCost;
            spawnable = {
                name: 'Upgrash' + Game.time + "-" + Math.round(Math.random() * (1000)),
                body: getMaximumBody([WORK, CARRY, MOVE], available),
                initMemory: { role: 'upgrader',
                target: room.name, base: room.name }
            };
            toSpawnCost += calculateSpawningCost(spawnable.body);
            spawnQueue.push(spawnable);
        }

        return spawnQueue;
    }
};

module.exports = logicSpawner;

function calculateSpawningCost(body) {
    return _.sum(body.map((b) => BODYPART_COST[b]));
}

function getMaximumBody(unit, energy) {

    let maxBody = [];
    let unitCost = 0;

    for (const p of unit) {
        unitCost += BODYPART_COST[p];
    }

    let unitsCount = (Math.floor(energy / unitCost) * unit.length > 50) ?
        Math.floor(50 / unit.length) : Math.floor(energy / unitCost);

    for (var i = 0; i < unitsCount; i++) {
        for (const p of unit) {
            maxBody.push(p);
        }
    }

    return maxBody;
} 
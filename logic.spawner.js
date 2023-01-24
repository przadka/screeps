/**
 * Spawner manages spawning process for each tick. 
 * For a given room in analyzes the current situtaion and tries to spawn creeps
 * taking into account energy available and adjusting creep size if needed.
 * Spawner does not actually spawn anything. Instead it returns a list
 * of creeps that should be spawned.
 * 
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
        var janitors = _.filter(Game.creeps, (creep) => creep.memory.role == 'janitor');
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

        var containers = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_CONTAINER))
            }
        });

        var links = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_LINK))
            }
        });

        //Hauler
        //if there is at least one container in the room we need a Hauler
        //to move energy around, try to spawn big hauler if possible
        //Haule will be first in the queue so it will have priority of
        //others
        if (containers.length > 0 && haulers.length == 0) {
            let available = energyAvailable - toSpawnCost;
            let haulerUnitCost = 2 * BODYPART_COST[CARRY] + 1 * BODYPART_COST[MOVE];
            //let haulerUnits = (Math.floor(available/haulerUnitCost)>8)?8:Math.floor(available/haulerUnitCost);
            let haulerUnits = Math.floor(available / haulerUnitCost);//TODO limit size?
            let body = [];

            for (var i = 0; i < haulerUnits; i++) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
            }

            spawnable = {
                name: 'Haurry' + Game.time + "-" + Math.round(Math.random() * (1000)),
                body: body,
                initMemory: {
                    role: 'hauler',
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
        //if there is Extractor present, spawn 1 more harvester to operate that

        //if we have conainers then we SHOULD have 
        //Hauler operating, so no need to Harvesters


        if (containers.length == 0) {
            //2 basic Harvesters should be operating 
            //if there is no container operated by Hauler
            for (var i = harvesters.length; i < 2; i++) {

                spawnable = {
                    name: 'Harvey' + Game.time + "-" + Math.round(Math.random() * (1000)),
                    body: [WORK, CARRY, MOVE],
                    initMemory: { role: 'harvester', assignment: 0, resourceCarried: 0 }
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
        for (var i = miners.length; i < containers.length; i++) {
            spawnable = {
                name: 'Minero' + Game.time + "-" + Math.round(Math.random() * (1000)),
                body: [WORK, WORK, WORK, WORK, WORK, MOVE],
                initMemory: { role: 'miner', assignment: 0, }
            };

            toSpawnCost += calculateSpawningCost(spawnable.body);
            spawnQueue.push(spawnable);
        }

        //Janitors
        for (var i = janitors.length; i < 3; i++) {

            let available = energyAvailable - toSpawnCost;
            let janitorUnitCost = 1 * BODYPART_COST[WORK] + 1 * BODYPART_COST[CARRY] + 1 * BODYPART_COST[MOVE];
            let janitorUnits = (Math.floor(available / janitorUnitCost) > 3) ? 3 : Math.floor(available / janitorUnitCost);

            let body = [];

            for (var j = 0; j < janitorUnits; j++) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
            }

            spawnable = {
                name: 'JayJay' + Game.time + "-" + Math.round(Math.random() * (1000)),
                body: body,
                initMemory: { role: 'janitor', fixedTimes: {} }
            };
            toSpawnCost += calculateSpawningCost(spawnable.body);
            spawnQueue.push(spawnable);
        }


        //Upgraders

        for (var i = upgraders.length; i < 2; i++) {

            spawnable = {
                name: 'Upgrash' + Game.time + "-" + Math.round(Math.random() * (1000)),
                body: [WORK, WORK, WORK, WORK, WORK,
                    WORK, WORK, WORK, WORK, WORK, CARRY,
                    CARRY, MOVE, MOVE],
                initMemory: { role: 'upgrader' }
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
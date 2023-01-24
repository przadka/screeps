var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleJanitor = require('role.janitor');
var roleMiner = require('role.miner');
var roleHauler = require('role.hauler');
var roleLinker = require('role.linker');
var tower = require('structure.tower');
var logicSpawner = require('logic.spawner');

const MY_ROOM = "E12N15";

module.exports.loop = function () {
    Game.cpu.generatePixel()

    //clean up memory
    if (Game.time % 1000 == 0) {
        for (var i in Memory.creeps) {
            if (!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
    }

    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

    var janitors = _.filter(Game.creeps, (creep) => creep.memory.role == 'janitor');
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
    var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var linkers = _.filter(Game.creeps, (creep) => creep.memory.role == 'linker');

    var towers = Game.rooms[MY_ROOM].find(FIND_STRUCTURES, {
        filter: (structure) => {
            return ((structure.structureType == STRUCTURE_TOWER))
        }
    });

    console.log("U:" + upgraders.length + ",J:" + janitors.length +
         ",M:" + miners.length +
        ",HAU:" + haulers.length +
        ",HAR:" + harvesters.length +
        ",L:" + linkers.length);

    var R1energyCapacity = Game.rooms[MY_ROOM].energyCapacityAvailable;
    var R1energyAvailable = Game.rooms[MY_ROOM].energyAvailable;

    console.log("Room 1 energy: " + R1energyAvailable + " out of " + R1energyCapacity + " Max");

    //spawning
    //spawn all creeps in spawn queue provided by Spawner
    var toSpawn = logicSpawner.run(Game.rooms[MY_ROOM]);
    
    for (const s of toSpawn) {
        Game.spawns['Spawn1'].spawnCreep(s.body, s.name, {memory: s.initMemory});

    }


    towers.forEach((t) => {
        tower.run(t);
    });

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
        if (creep.memory.role == 'janitor') {
            roleJanitor.run(creep);
        }
        if (creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if (creep.memory.role == 'hauler') {
            roleHauler.run(creep);
        }
        if (creep.memory.role == 'linker') {
            roleLinker.run(creep);
        }
    }
}

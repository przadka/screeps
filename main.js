var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleMiner = require('role.miner');
var roleHauler = require('role.hauler');
var roleLinker = require('role.linker');

module.exports.loop = function () {
    Game.cpu.generatePixel()
    //clean up memory
    if (Game.time%1000==0) {
        for(var i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
    }
    
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
    var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var linkers = _.filter(Game.creeps, (creep) => creep.memory.role == 'linker');

    console.log("U:"+upgraders.length+",B:"+builders.length+
    ",R:"+repairers.length+",M:"+miners.length+
    ",HAU:"+haulers.length+
    ",HAR:"+harvesters.length+
    ",L:"+linkers.length);


    if(haulers.length < 1) {
        var newName = 'Hauler' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, 
               CARRY,CARRY, CARRY,CARRY,MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
            {memory: {role: 'hauler', transporting: false, assignment: 0}});        
    }

    
    if(upgraders.length < 3) {
        var newName = 'Upgrader' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,CARRY, MOVE], newName, 
            {memory: {role: 'upgrader'}});        
    }
    
    if(harvesters.length < 2) {
        var newName = 'Harvester' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY, MOVE], newName, 
            {memory: {role: 'harvester', assignment: 0}});        
    }

    //TODO spawn builder only if we have some contructions sites
   if (builders.length < 3) {
        var newName = 'Builder' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName, 
            {memory: {role: 'builder'}});        
    }

    if(repairers.length < 2) {
        var newName = 'Repairer' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE, MOVE], newName, 
            {memory: {role: 'repairer'}});        
    }
    

    if(miners.length < 2) {
        var newName = 'Miner' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK, CARRY, MOVE], newName, 
            {memory: {role: 'miner', assignment: 0, fixedContainerTime: 0}});        
    }

    if(linkers.length < 1) {
        var newName = 'Linker' + Game.time;
        console.log('Spawning new linker: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK, CARRY, CARRY, CARRY, MOVE, MOVE], newName, 
            {memory: {role: 'linker', assignment: 0}});        
    }



    var tower = Game.getObjectById('63b1d04fd9a13e38b95e442a'); //?????
    
    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    
    if(closestHostile) {
            tower.attack(closestHostile);
    }
/*
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }


    }
*/
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
        if(creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if(creep.memory.role == 'hauler') {
            roleHauler.run(creep);
        }
        if(creep.memory.role == 'linker') {
            roleLinker.run(creep);
        }
    }
}

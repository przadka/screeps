/**
 * Hauler transports resources from containers to destination.
 * It has two states: either transporting the payload
 * or collecting the payload from containers. When spawned
 * haulers start collecting energy (not transporting).
 * Change from collecting to transporting occurs when a hauler
 * which is collecting fills it’s capacity to full. Change
 * from transporting to collecting occurs if a transporting
 * huler is empty.
 * 
 * There are three variables describing hauler state:
 *  - transporting - whether it's currently transporing 
 *      collecting
 *  - assignment - containers assigned to hauler during 
 *      collecting phase (so that the hauler doesn't flick
 *      between different containers when collecting payload.)
 *  - payload - currently transported payload.
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
                creep.memory.assignment = this.findFullestContainer(creep.room, creep.memory.payload).id;
                //if i have some payload left, just start transporting whathever is left

            }

            //if full or I emptied container - start transporting
            if (creep.store.getFreeCapacity(creep.memory.payload) == 0 ||
                (creep.store.getUsedCapacity(creep.memory.payload) > 0 
                && my_container.store.getUsedCapacity(creep.memory.payload) == 0)) {
                creep.say('⚡transport');
                creep.memory.assignment = 0;
                creep.memory.transporting = true;
            }
        } else { //transporting state
            if (creep.store[creep.memory.payload] == 0) {
                //I transported all my payload
                //start collecting
                creep.say('🔄collect');
                creep.memory.transporting = false;

                let shippableMinerals = this.getShippableMinerals(creep.room);
      

                if (_.size(shippableMinerals) > 0 && this.isRoomHealthy(creep.room)) {
                    //i can collect some mineral
                    //for reach mineral, I have a list of containers that
                    //have this mineral and are almost full

                    let shipmentMineral = _.get(_.keys(shippableMinerals), 0);
                    let shipmentContainer = _.get(_.values(shippableMinerals), 0)[0].id;

                    creep.memory.payload = shipmentMineral;

                    //creep.memory.assignment = shipmentContainer; 
                    //TODO maybe this is better because I alreayd have this container 
                    //so i dont need to find it laters with find Containers

                } else {
                    creep.memory.payload = RESOURCE_ENERGY;    
                }

                creep.memory.assignment = this.findFullestContainer(creep.room, creep.memory.payload).id;
                //TODO what if there is no container??? return null?
            }
        }

        //behaviour code - do whathever needs to be done
        if (creep.memory.transporting) {
            //transporting payload 
            var targets = this.findTargetsForPayload(creep.room, creep.memory.payload);
            var my_target = null;

            if (targets.length > 1) {
                //from all targets with lowest capacity 
                //get the closest one

                let best_targets = _.filter(targets, (t) => t.store.getCapacity() == targets[0].store.getCapacity());
                my_target = creep.pos.findClosestByPath(best_targets);;

            } else {
                if (targets.length == 1) {
                    my_target = targets[0];
                }
            }

            if (my_target === null) {
                console.log("WARNING: Hauler has payload but there is no destination in the room " + creep.room.name);
            } else {
                if (creep.transfer(my_target, creep.memory.payload) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(my_target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        } else {
            //collecting payload from assigned container

            var my_container = Game.getObjectById(creep.memory.assignment);
            //TODO see if there is any energy that was dropped
            // var dropeed = creep.room.find(FIND_DROPPED_RESOURCES, RESOURCE_ENERGY);

            if (creep.withdraw(my_container, creep.memory.payload) == ERR_NOT_IN_RANGE) {
                creep.moveTo(my_container, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
            //TODO if container is empty and there is no miner working - harvest directly

        }

    },

    /**
     * @param {Room} room
     * @param {Resource} resource
     */
    findFullestContainer: function (room, resource) {
        //finds the fullest of all containers in a given room
        //for a given resource

        var containers = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_CONTAINER)
                    && structure.pos.getRangeTo(structure.pos.findClosestByRange(resource == RESOURCE_ENERGY ? FIND_SOURCES : FIND_MINERALS)) < 2)
            }
        });

        return containers.reduce((prev, current) =>
            (prev.store[resource] > current.store[resource]) ? prev : current);
    },

    /**
     * @param {Room} room
     */

    isRoomHealthy: function (room) {
        return (room.energyAvailable/room.energyCapacityAvailable>0.9);
    },


    getShippableMinerals: function (room) {
        let shippableContainers = {};

        var mineableDeposits =
            room.find(FIND_MINERALS, {
                filter: (deposit) => {
                    return (deposit.pos.getRangeTo(deposit.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_CONTAINER)
                        }
                    })) < 2)
                }
            });

        var containers = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_CONTAINER))
            }
        });

        for (const d of mineableDeposits) {
            let shipmentsForMineral = _.filter(containers, (c) =>
                (c.store.getUsedCapacity(d.mineralType) / c.store.getCapacity(d.mineralType) > 0.9));

            if (shipmentsForMineral.length > 0) {
                shippableContainers[d.mineralType] = shipmentsForMineral;
            }

        }

        return shippableContainers;
    },


    findTargetsForPayload: function (room, resource) {
        let targets = [];
        if (resource == RESOURCE_ENERGY) {
            targets = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION
                        || structure.structureType == STRUCTURE_SPAWN
                        || structure.structureType == STRUCTURE_STORAGE
                        || structure.structureType == STRUCTURE_TOWER
                        && (structure.store.getUsedCapacity(RESOURCE_ENERGY) / structure.store.getCapacity(RESOURCE_ENERGY) < 0.6)//towers with energy below 60%
                    ) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            //sort by capacity, trying to fill 
            //in smaller targets first

            targets = targets.sort((a, b) =>
                (a.store.getCapacity() - b.store.getCapacity()));
        } else {
            // mineral should be transported to storage
            targets = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE
                        && structure.store.getFreeCapacity(resource) > 0);
                }
            });
        }
        return targets;
    }

};

module.exports = roleHauler;

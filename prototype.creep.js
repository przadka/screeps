
/**
 * Check if rooms needs to be changed based on base/target
 * variables. If it should then move towards relevant
 * exit.
 * 
 * @returns True if room should be changed and creep is moving towards it.
 */
Creep.prototype.changeRoomsIfNeeded = function () {

    //if empty and my base is in a different room, go to base to fill up
    if (this.store.getCapacity() > 0 &&
        (this.store.getFreeCapacity() == this.store.getCapacity()) &&
        (this.memory.base != undefined) && (this.room.name != this.memory.base)) {
        //find exit to the base room
        let exit = this.room.findExitTo(this.memory.base);
        this.moveTo(this.pos.findClosestByRange(exit));
        return true; //refactor?
    }

    //if still some energy can be added
    // and my base is this room, then don't switch rooms
    if (this.store.getCapacity() > 0 &&
        (this.store.getFreeCapacity() > 0) &&
        (this.memory.base != undefined) && (this.room.name == this.memory.base)) {
        return false; //refactor?
    }

    //if here, i dont need to fill up
    //check if i should ove to another room 
    if ((this.memory.target != undefined) && (this.room.name != this.memory.target)) {
        //find exit to the target room
        let exit = this.room.findExitTo(this.memory.target);
        this.moveTo(this.pos.findClosestByRange(exit));
        return true; //refactor?
    }

    return false;
}

/**
 * Check if there is some dropped energy in the room and try to 
 * collect it. Should be called by any creep that may need some energy.
 * 
 * @returns True if energy was found and picked or moved towards.
 */
Creep.prototype.pickDroppedEnergyIfAny = function () {

    let dropped = this.room.find(FIND_DROPPED_RESOURCES, {
        filter: (r) => r.resourceType == RESOURCE_ENERGY && r.amount >= 100
    });


    if (dropped.length > 0) {
        //if there is anything dropped - pick it
        var dropped_closest = this.pos.findClosestByPath(dropped);

        if (this.pickup(dropped_closest) == ERR_NOT_IN_RANGE) {
            this.moveTo(dropped_closest);
        }
        return true;
    } 

    return false;
}

/**
 * Simple log wrapper to make sure it prints nicely for a creep.
 * @param {*} msg A string that should be printed by this creep.
 */
Creep.prototype.log = function(msg){
    console.log(this.name + " : "+msg+" ("+this.room.name+")");
}
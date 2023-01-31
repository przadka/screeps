/*
 * Claims new rooms.

 */

var roleClaimer = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.room.name != creep.memory.target) {
            //find exit to the target room
            let exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByRange(exit));
        } else {
            //try to claim
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
    
    }
};

module.exports = roleClaimer;
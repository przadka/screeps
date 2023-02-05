/*
 * Claims new rooms.
 */

var roleClaimer = {

    /** @param {Creep} creep **/
    run: function (creep) {
        
        if (creep.changeRoomsIfNeeded())
            return;

        //try to claim
        let status = creep.claimController(creep.room.controller);
        if (status == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        } else {
            console.log("Failed claiming with code: " + status);
        }
    }
};

module.exports = roleClaimer;
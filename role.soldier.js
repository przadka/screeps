
var roleSoldier = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.changeRoomsIfNeeded())
            return;

        let closest_hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        if (closest_hostile) {
            if (creep.attack(closest_hostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closest_hostile);
            }
        }

        /*
        if (creep.room.name != creep.memory.target) {
            //find exit to the target room
            let exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByRange(exit));
        } else {

            let closest_hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

            if (closest_hostile) {
                if (creep.attack(closest_hostile) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest_hostile);
                }
            }
        }
        */
    }
};

module.exports = roleSoldier;
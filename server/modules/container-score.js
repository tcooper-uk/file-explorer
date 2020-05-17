/*
* Basic container scoring implementation
* Using the amounts of direct, indiect and special identifiers
* found in a container do the following:
*
*   1) Calculate the level of each identifier. (This requries more work to take diversity into account)
*   2) Identify if we have a potential composite identity or not
*   3) Using levels of find position on the scale (0 - 100)
*/

const START_SCORE = 100 // total size of scale
const BLOCK_SIZE = START_SCORE / (3 * 2) // block size of each label for both halfs - 16.666666667
const BLOCK_PARTS_SIZE = BLOCK_SIZE / 3 // 5.555555556

var Level = {

    Nothing: 0,
    One: 1,
    Two: 2,
    Three: 3
};

function calculateLevel(direct, indirect, special) {

    var levels = {
        Direct: Level.Nothing,
        Secondary: Level.Nothing,
        Special: Level.Nothing
    };

    if(direct !== 0){
        // direct
        if(direct < 5){
            levels.Direct = Level.One;
        }
        else if(direct >= 5 && direct < 100) {
            levels.Direct = Level.Two;
        }
        else if(direct >= 100){
            levels.Direct = Level.Three;
        }
    }


    if(indirect !== 0){
        // secondary
        if(indirect < 10){
            levels.Secondary = Level.One;
        }
        else if(indirect >= 10 && indirect < 200){
            levels.Secondary = Level.Two;
        }
        else if(indirect >=200){
            levels.Secondary = Level.Three;
        }
    }

    if(special !== 0){
        // special
        if(special < 20){
            levels.Special = Level.One;
        }
        else if(special >= 20 && special < 400){
            levels.Special = Level.Two;
        }
        else if(special >= 400){
            levels.Special = Level.Three;
        }
    }

    return levels;
}

function calculateContainerScore(levels){

    var score = START_SCORE;

    if(__hasComposite(levels.Direct, levels.Secondary, levels.Special)){

        // pick direct bucket
        score = START_SCORE / 2;
        score += (BLOCK_SIZE * levels.Direct);

        // find center of bucket
        score -= BLOCK_PARTS_SIZE;

        if(levels.Direct == levels.Secondary){
            // position correct just move by special
            score = __swingBySpecial(score, levels.Special);
        } else {

            if(levels.Direct > levels.Secondary){
                // moving down scale
                var moveBy = (levels.Direct - levels.Secondary) * 2;
                score -= (BLOCK_PARTS_SIZE * moveBy);
            } else {
                // moving up the scale
                var moveBy = (levels.Secondary - levels.Direct) * 2;
                score += (BLOCK_PARTS_SIZE * moveBy);
            }
            // calculate position for special
            score = __swingBySpecial(score, levels.Special);
        }
    } else {
        // start of the scale
        score -= START_SCORE;

        var hasDirect = levels.Direct !== Level.Nothing;
        var hasSecondary = levels.Secondary !== Level.Nothing;
        var hasSpecial = levels.Special !== Level.Special;

        if(hasDirect && hasSecondary){
            // move to start
            score += BLOCK_SIZE;

            // increment by direct value
            score += (BLOCK_SIZE * levels.Direct);

            // swing by secondary
            if(levels.Secondary == Level.Three)
                score += BLOCK_PARTS_SIZE;
            else
                score -= (Level.Three - levels.Secondary);

        } else if(hasDirect){
            // move to start
            score += (BLOCK_SIZE - BLOCK_PARTS_SIZE);

            // increment direct value
            score += (BLOCK_SIZE * levels.Direct);

            // update by special if required
            if(hasSpecial)
                score = __swingBySpecial(score, levels.Special);
            else
                score -= (BLOCK_PARTS_SIZE * 2);

        } else if (hasSecondary) {
            // move to start
            score += (BLOCK_PARTS_SIZE * 2);
            
            // increment secondary
            score += (levels.Secondary * (BLOCK_PARTS_SIZE * 2));

            // swing by special
            if(hasSpecial)
                score = __swingBySpecial(score, levels.Special);
            else
                score -= (BLOCK_PARTS_SIZE * 2);

        } else {
            // we just have special
            score += (BLOCK_PARTS_SIZE * levels.Special)
        }

    }

    return Math.round(score);
}

var __hasComposite = function(d, s, sp) {
    return  d !== Level.Nothing &&
            s !== Level.Nothing &&
            sp !== Level.Nothing;
}

var __swingBySpecial = function(s, l) {
    // Move to score by the level of the special label
    // TODO This should not be hard code to the amount of levels
    if (l === Level.Two){
        return s;
    }
    else if (l === Level.One || l === Level.Nothing) {
        s -= BLOCK_PARTS_SIZE;
        return s
    }
    else {
        s += BLOCK_PARTS_SIZE
        return s
    }
}

module.exports.calculateLevel = calculateLevel;
module.exports.calculateContainerScore = calculateContainerScore;
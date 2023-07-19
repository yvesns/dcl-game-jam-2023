import { Vector3 } from "@dcl/sdk/math"
import { width, height } from "./constants"
import * as Utils from "./utils"

export class NeatFlappyBirdDclAdapter {
    dclPosition
    scale = 1
    dclBoundaries

    constructor(dclPosition, scale,  dclBoundaries) {
        this.dclPosition = dclPosition
        this.scale = scale
        this.dclBoundaries = dclBoundaries
    }

    getDclPosition() {
        return this.dclPosition
    }

    getScaledValue(value) {
        return value * scale
    }

    getDclXCoord(neatXCoord) {
        // const dclXCoord = Utils.adjustValueToNewRange(neatXCoord, 0, width, 0, this.dclBoundaries.x)

        // return dclXCoord + this.dclPosition.x

        return Utils.adjustValueToNewRange(neatXCoord, 0, width, 0, this.dclBoundaries.x)
    }

    getDclYCoord(neatYCoord) {
        // const dclYCoord = Utils.adjustValueToNewRange(neatYCoord, 0, height, 0, this.dclBoundaries.y)

        // return dclYCoord + this.dclPosition.y

        // console.log("height")
        // console.log(height)
        // console.log("neatYCoord")
        // console.log(neatYCoord)
        // console.log("height - neatYCoord")
        // console.log(height - neatYCoord)

        return Utils.adjustValueToNewRange(height - neatYCoord, 0, height, 0, this.dclBoundaries.y)
    }
}
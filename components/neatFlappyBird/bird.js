import { width, height } from "./constants";
import * as Utils from "./utils"

export default class Bird {
    y = height / 2
    x = 64
    dead = false
    gravity = 0.8
    lift = -1
    velocity = 0
    score = 0
    fitness = 0

    getX() {
        return this.x
    }

    getY() {
        return this.y
    }

    isDead() {
        return this.dead
    }
  
    show() {
        // if(!this.dead) {
        //     stroke(255);
        //     fill(255, 100);
        //     ellipse(this.x, this.y, 32, 32);
        // }
    }
  
    up() {
        if(!this.dead) {
            this.velocity += this.lift
        }
    }
  
    closestP(pipes) {
        // Find the closest pipe
        let closest = null
        let closestD = Infinity

        for(let i = 0; i < pipes.length; i++) {
            let d = (pipes[i].x + pipes[i].w) - this.x

            if(d < closestD && d > 0) {
                closest = pipes[i]
                closestD = d
            }
        }

        return closest
    }

    map(value, minValue, maxValue, minTargetValue, maxTargetValue) {
        const valuePercentage = (value - minValue) / (maxValue - minValue)
        const zeroBasedMaxTargetValue = maxTargetValue - minTargetValue
        
        return zeroBasedMaxTargetValue * valuePercentage + minTargetValue
    }
    
    inputss(pipes) {
        let inputs = []
        let closest = this.closestP(pipes)

        // inputs[0] = this.map(closest.x, this.x, width, 0, 1);
        // // top of closest pipe opening
        // inputs[1] = this.map(closest.top, 0, height, 0, 1);
        // // bottom of closest pipe opening
        // inputs[2] = this.map(closest.bottom, 0, height, 0, 1);
        // // bird's y position
        // inputs[3] = this.map(this.y, 0, height, 0, 1);
        // // bird's y velocity
        // inputs[4] = this.map(this.velocity, -5, 5, 0, 1);

        // console.log("Closest x")
        // console.log(closest.x)
        // console.log("This x")
        // console.log(this.x)

        inputs[0] = Utils.adjustValueToNewRange(closest.x, this.x, width, 0, 1);
        // top of closest pipe opening
        inputs[1] = Utils.adjustValueToNewRange(closest.top, 0, height, 0, 1);
        // bottom of closest pipe opening
        inputs[2] = Utils.adjustValueToNewRange(closest.bottom, 0, height, 0, 1);
        // bird's y position
        inputs[3] = Utils.adjustValueToNewRange(this.y, 0, height, 0, 1);
        // bird's y velocity
        inputs[4] = Utils.adjustValueToNewRange(this.velocity, -5, 5, 0, 1);

        // console.log(inputs)
        // console.log(Utils.adjustValueToNewRange(25, 25, 100, 90, 200))

        return inputs;
    }
  
    offScreen() {
        // console.log("this.y > height")
        // console.log(this.y > height)
        // console.log("this.y < 0")
        // console.log(this.y < 0)

        return (this.y > height || this.y < 0)
    }
  
    update() {
        this.score++
        this.velocity += this.gravity
        //this.velocity *= 0.9;
        this.y += this.velocity

        // console.log(this.y)
    }
}
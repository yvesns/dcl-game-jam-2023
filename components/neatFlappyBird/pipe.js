import { width, height } from "./constants";

export default class Pipe {
    spacing = 125
    top = Math.random(height / 15, 3 / 4 * height)
    bottom = height - (this.top + this.spacing)
    x = width
    w = 80
    speed = 6
    isValid = true
  
    hits(bird) {
        if(bird.y < this.top || bird.y > height - this.bottom) {
            if (bird.x > this.x && bird.x < this.x + this.w) {
                return true
            }
        }

        return false
    }
  
    // show() {
    //     fill(255);
    //     rectMode(CORNER);
    //     rect(this.x, 0, this.w, this.top);
    //     rect(this.x, height - this.bottom, this.w, this.bottom);
    // }
  
    update() {
        this.x -= this.speed
    }
  
    offscreen() {
        return this.x < -this.w
    }
}
  
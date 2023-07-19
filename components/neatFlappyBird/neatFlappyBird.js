import { engine } from "@dcl/sdk/ecs"
import { NeatFlappyBirdModel } from "./model"
import { NeatFlappyBirdUI } from "./ui"

export class NeatFlappyBird {
    model
    ui
    updateTime = 0
    updateTimeLimit = 2
    iterationFinishedCallback

    constructor(dclAdapter) {
        this.model = new NeatFlappyBirdModel(1)
        this.ui = new NeatFlappyBirdUI(this.model, dclAdapter)
    }

    getGeneration() {
        return this.model.getGeneration()
    }

    loop(iterationFinishedCallback) {
        this.iterationFinishedCallback = iterationFinishedCallback
        engine.addSystem(this.executeSystem.bind(this))
    }

    execute() {
        this.model.execute()
    }

    executeSystem(dt) {
        this.updateTime += dt

        if(this.updateTime < this.updateTimeLimit) {
            return
        }

        this.updateTime = 0

        this.model.execute()
        this.iterationFinishedCallback(this.getGeneration())
    }
}
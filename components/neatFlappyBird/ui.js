import { Material, Transform, VisibilityComponent, engine } from "@dcl/sdk/ecs"
import * as Misc from "../../src/misc"
import { Vector3 } from "@dcl/sdk/math"
import { NeatFlappyBirdDclAdapter } from "./neatFlappyBirdDclAdapter"
import { ObjectPool } from "./utils"

class BirdPlane {
    static texture = Material.Texture.Common({
        src: 'images/bird3.png',
    })
    static material = {texture: this.texture}

    neatModel
    birdIndex
    bird
    plane
    dclAdapter
    transform
    updateTime = 0
    updateTimeLimit = 0.001

    constructor(birdIndex, parent) {
        this.neatModel = parent.getNeatModel()
        this.birdIndex = birdIndex
        this.bird = this.neatModel.getBirds()[this.birdIndex]
        this.plane = Misc.createPlane(Vector3.create(0, 0, 0))
        this.dclAdapter = parent.getDclAdapter()

        Transform.getMutable(this.plane).parent = parent.getEntity()
        Transform.getMutable(this.plane).position.x = this.dclAdapter.getDclXCoord(this.bird.getX())
        Transform.getMutable(this.plane).position.y = this.dclAdapter.getDclYCoord(this.bird.getY())

        Material.setBasicMaterial(this.plane, BirdPlane.material)
        VisibilityComponent.create(this.plane, { visible: true })

        engine.addSystem(this.update.bind(this))
    }

    update(dt) {
        this.updateTime += dt

        if(this.updateTime < this.updateTimeLimit) {
            return
        }

        this.updateTime = 0

        if(this.bird.isDead()) {
            // console.log("Bird is dead, refreshing")
            this.bird = this.neatModel.getBirds()[this.birdIndex]

            VisibilityComponent.getMutable(this.plane).visible = !this.bird.isDead()

            return
        }

        // this.transform.position.y = this.dclAdapter.getDclXCoord(bird.getY())
        // this.transform.position.y = this.dclAdapter.getDclYCoord(this.bird.getY())
        Transform.getMutable(this.plane).position.y = this.dclAdapter.getDclYCoord(this.bird.getY())
    }
}

class PipePlane {
    static texture = Material.Texture.Common({
        src: 'images/stone_statue.png',
    })
    static material = {texture: this.texture}

    plane
    pipe = null
    dclAdapter
    updateTime = 0
    updateTimeLimit = 0.01

    constructor(parent) {
        this.plane = Misc.createPlane(Vector3.create(0, 0, 0))
        this.dclAdapter = parent.getDclAdapter()

        Transform.getMutable(this.plane).parent = parent.getEntity()
        Material.setBasicMaterial(this.plane, PipePlane.material)
        VisibilityComponent.create(this.plane, { visible: false })

        engine.addSystem(this.update.bind(this))
    }

    isFree() {
        return !VisibilityComponent.getMutable(this.plane).visible
    }

    track(pipe) {
        this.pipe = pipe
        Transform.getMutable(this.plane).position.x = this.dclAdapter.getDclXCoord(pipe.x)
        VisibilityComponent.getMutable(this.plane).visible = true
    }

    update(dt) {
        this.updateTime += dt

        if(this.updateTime < this.updateTimeLimit) {
            return
        }

        this.updateTime = 0

        if(this.pipe === null) {
            return
        }

        if(!this.pipe.isValid) {
            VisibilityComponent.getMutable(this.plane).visible = false
            this.pipe = null

            return
        }

        // console.log(Transform.getMutable(this.plane).position.x)
        // console.log(this.pipe.x)

        Transform.getMutable(this.plane).position.x = this.dclAdapter.getDclXCoord(this.pipe.x)
    }
}

export class NeatFlappyBirdUI {
    neatModel
    position
    pipes
    birdPlanes = []
    pipePlanePool
    pipePlaneCount = 1
    trackedPipes = []
    containerEntity
    dclAdapter
    updateTime = 0
    updateTimeLimit = 0.01

    constructor(neatModel, dclAdapter){
        this.neatModel = neatModel
        this.dclAdapter = dclAdapter

        this.initContainerEntity(dclAdapter)
        this.initBirds()
        this.initPipes()

        engine.addSystem(this.update.bind(this))
    }

    initContainerEntity(dclAdapter) {
        this.containerEntity = engine.addEntity()
        Transform.create(this.containerEntity, {position: dclAdapter.getDclPosition()})
    }

    initBirds() {
        const birds = this.neatModel.getBirds()

        for(let b = 0; b < birds.length; b++) {
            this.birdPlanes.push(new BirdPlane(b, this))
        }
    }

    initPipes() {
        this.pipes = this.neatModel.getPipes()
        this.pipePlanePool = new ObjectPool()

        for(let i = 0; i < this.pipePlaneCount; i++) {
            this.pipePlanePool.addObject(new PipePlane(this))
        }
    }

    getEntity() {
        return this.containerEntity
    }

    getDclAdapter() {
        return this.dclAdapter
    }

    getNeatModel() {
        return this.neatModel
    }

    update(dt) {
        this.updateTime += dt

        if(this.updateTime < this.updateTimeLimit) {
            return
        }

        this.updateTime = 0

        for(let i = 0; i < this.trackedPipes.length; i++) {
            if(!this.trackedPipes[i].isValid) {
                this.trackedPipes.splice(i, 1)
            }
        }

        for(let i = 0; i < this.pipes.length; i++) {
            if(this.trackedPipes.includes(this.pipes[i])) {
                continue 
            }

            this.trackedPipes.push(this.pipes[i])
            this.pipePlanePool.getFreeObject().track(this.pipes[i])
        }
    }
}
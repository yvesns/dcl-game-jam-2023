import { Entity, GltfContainer, Material, Transform, engine } from "@dcl/sdk/ecs"
import { Color4, Vector3 } from "@dcl/sdk/math"
import { BluePillar, GreenPillar, RedPillar } from "./components"
import * as utils from '@dcl-sdk/utils'

export class PillarMinigame {
    container: Entity
    pillars: any
    width: number
    height: number
    baseOffset = 3

    constructor(position: Vector3, width: number, height: number) {
        this.container = engine.addEntity()
        this.pillars = []
        this.width = width
        this.height = height

        Transform.create(this.container, {position: position})

        this.randomize()
        // utils.triggers.enableDebugDraw(true)
    }

    reset() {
        this.pillars.forEach((pillar: any) => {
            Transform.getMutable(pillar).position.y = 0
        })
    }

    randomize() {
        this.pillars.forEach((pillar: Entity) => {
            engine.removeEntity(pillar)
        });

        for(let i = 0; i < this.width; i++) {
            for(let j = 0; j < this.height; j++) {
                this.pillars.push(this.createPillar(i * this.baseOffset, j * this.baseOffset))
            }
        }
    }

    createPillar(x: number, y: number) {
        const pillar = engine.addEntity()

        Transform.create(pillar, {
            parent: this.container,
            position: Vector3.create(x, 0, y)
        })

        this.randomizePillarColor(pillar)
    }

    randomizePillarColor(pillar: Entity) {
        const seed = Math.random()

        if(seed <= 0.33) {
            RedPillar.create(pillar)
            GltfContainer.create(pillar, {
                src: 'models/red_pillar.glb',
            })
            this.createPillarTrigger(pillar, this.redPillarTriggerFunction.bind(this))

            return pillar
        }

        if(seed <= 0.66) {
            BluePillar.create(pillar)
            GltfContainer.create(pillar, {
                src: 'models/blue_pillar.glb',
            })
            this.createPillarTrigger(pillar, this.bluePillarTriggerFunction.bind(this))

            return pillar
        }

        GreenPillar.create(pillar)
        GltfContainer.create(pillar, {
            src: 'models/green_pillar.glb',
        })
        this.createPillarTrigger(pillar, this.greenPillarTriggerFunction.bind(this))

        return pillar
    }

    createPillarTrigger(pillar: Entity, triggerFunction: any) {
        utils.triggers.addTrigger(
            pillar, 
            utils.NO_LAYERS, 
            utils.LAYER_1, 
            [{
                type: 'box', 
                scale: Vector3.create(1, 1, 1),
                position: Vector3.create(0, 4, 0),
            }],
            triggerFunction
        )
    }

    redPillarTriggerFunction() {
        this.adjustPillarGroups(
            engine.getEntitiesWith(BluePillar), 
            engine.getEntitiesWith(GreenPillar)
        )
    }

    bluePillarTriggerFunction() {
        this.adjustPillarGroups(
            engine.getEntitiesWith(GreenPillar), 
            engine.getEntitiesWith(RedPillar)
        )
    }

    greenPillarTriggerFunction() {
        this.adjustPillarGroups(
            engine.getEntitiesWith(RedPillar), 
            engine.getEntitiesWith(BluePillar)
        )
    }

    adjustPillarGroups(upGroup: any, downGroup: any) {
        const topY = 0
        const bottomY = -5
        let pillarPosition

        for(const [pillar] of upGroup) {
            pillarPosition = Transform.get(pillar).position

            utils.tweens.startTranslation(
                pillar, 
                pillarPosition,
                Vector3.create(pillarPosition.x, topY, pillarPosition.z),
                1,  
                utils.InterpolationType.LINEAR
            )
        }

        for(const [pillar] of downGroup) {
            pillarPosition = Transform.get(pillar).position

            utils.tweens.startTranslation(
                pillar, 
                pillarPosition,
                Vector3.create(pillarPosition.x, bottomY, pillarPosition.z),
                1,  
                utils.InterpolationType.LINEAR
            )
        }
    }
}
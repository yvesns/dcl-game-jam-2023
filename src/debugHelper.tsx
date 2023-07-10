import { InputAction, PointerEventType, Transform, engine, inputSystem } from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { ReactEcs, ReactEcsRenderer, UiEntity} from '@dcl/sdk/react-ecs'
import { movePlayerTo } from '~system/RestrictedActions'

export class DebugHelper {
    playerCurrentPosition: string = ""

    constructor() {
        ReactEcsRenderer.setUiRenderer(() => (
            <UiEntity
                uiTransform={{
                        width: '100%',
                        height: '100px',
                        justifyContent: 'center',
                        alignItems: 'center',
                }}
                uiText={{ value: `Player: `+  this.playerCurrentPosition, fontSize: 40 }}
                uiBackground={{ color: Color4.create(0.5, 0.8, 0.1, 0.6) }}
            />
        ))

        engine.addSystem(this.displayPlayerPosition.bind(this))
        engine.addSystem(this.fly.bind(this))
        engine.addSystem(this.moveToEntrance.bind(this))
    }

    displayPlayerPosition() {
        const player = Transform.getOrNull(engine.PlayerEntity)

        if(!player) {
            return
        }

        const {x, y, z} = player.position
        this.playerCurrentPosition =  `{x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, z: ${z.toFixed(2)} }`
    }

    fly() {
        if(!inputSystem.isPressed(InputAction.IA_PRIMARY)){
            return
        }

        const player = Transform.getOrNull(engine.PlayerEntity)

        if(!player) {
            return
        }

        movePlayerTo({
            newRelativePosition: Vector3.create(
                player.position.x,
                player.position.y + 20,
                player.position.z
            ),
        })
    }

    moveToEntrance() {
        if(!inputSystem.isTriggered(InputAction.IA_SECONDARY, PointerEventType.PET_DOWN)){
            return
        }

        const player = Transform.getOrNull(engine.PlayerEntity)

        if(!player) {
            return
        }

        // -22.42, 20.29, -60
        movePlayerTo({
            // Entrance
            // newRelativePosition: Vector3.create(
            //     0,
            //     20.31,
            //     23
            // ),

            // Left statue
            // newRelativePosition: Vector3.create(
            //     -22.42,
            //     20.29,
            //     -60
            // ),

            // Right statue
            // newRelativePosition: Vector3.create(
            //     -43.79, 
            //     20.29, 
            //     -60
            // ),

            // Obelisk
            // newRelativePosition: Vector3.create(
            //     -10.26, 
            //     20.3, 
            //     -58.21
            // ),

            // Treasure room
            // newRelativePosition: Vector3.create(
            //     -45, 
            //     20.3, 
            //     -34.36
            // ),

            // Long hallway left end
            // newRelativePosition: Vector3.create(
            //     60, 
            //     20.31, 
            //     -13.73
            // ),

            // Right statue room
            // newRelativePosition: Vector3.create(
            //     -44.79, 
            //     20.29, 
            //     -60
            // ),

            // Triple room
            // newRelativePosition: Vector3.create(
            //     32.53, 
            //     1, 
            //     -23.71
            // ),

            // Cross room 1
            // newRelativePosition: Vector3.create(
            //     41.37, 
            //     31.42, 
            //     -22.54
            // ),

            // Cross room 2
            // newRelativePosition: Vector3.create(
            //     40.74, 
            //     16.23, 
            //     -24.14
            // ),

            // Cross room 3
            // newRelativePosition: Vector3.create(
            //     45.48, 
            //     2.37, 
            //     -24.84
            // ),

            // Pillar grid
            newRelativePosition: Vector3.create(
                33.43, 
                22.04, 
                -51.26
            ),
        })
    }
}
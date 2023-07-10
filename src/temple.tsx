import { Animator, AudioSource, Entity, GltfContainer, InputAction, Material, MeshCollider, MeshRenderer, TextShape, Transform, VisibilityComponent, engine, pointerEventsSystem } from "@dcl/sdk/ecs";
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math";
import { movePlayerTo } from "~system/RestrictedActions";
import * as utils from '@dcl-sdk/utils'
import { ReactEcs, Label, ReactEcsRenderer, UiEntity} from '@dcl/sdk/react-ecs'
import { NeatFlappyBirdDclAdapter } from "../components/neatFlappyBird/neatFlappyBirdDclAdapter";
import { NeatFlappyBird } from "../components/neatFlappyBird/neatFlappyBird";
import { PillarMinigame } from "./pillarMinigame";
import { onSceneReadyObservable } from '@dcl/sdk/observables'

onSceneReadyObservable.add(() => {
    movePlayerTo({
        newRelativePosition: Vector3.create(0, 20.31, 23),
        cameraTarget: Vector3.create(0, 20.35, 15.68),
    })
})

enum Item {
    EMERALD,
    SAPPHIRE,
    RUBY,
    DIAMOND,
    DREAMCATCHER,
}

enum Flag {
    OBELISK_PUZZLE_DONE,
    HALLWAY_TRIGGERED,
}

class Inventory {
    static instance: any = null
    items: any

    constructor() {
        this.items = []
    }

    addItem(item: Item) {
        this.items.push(item)
    }

    removeItem(item: Item) {
        for(let i = 0; i < this.items.length; i++) {
            if(this.items[i] == item) {
                this.items.splice(i, 1)
                return
            }
        }
    }

    hasItem(item: Item) {
        for(let i = 0; i < this.items.length; i++) {
            if(this.items[i] == item) {
                return true
            }
        }

        return false
    }

    getItemCount(pItem: Item) {
        let itemCount = 0

        this.items.forEach((item: any) => {
            if(pItem == item) {
                itemCount += 1
            }
        }) 

        return itemCount
    }

    static getInstance() {
        if(this.instance == null) {
            this.instance = new Inventory()
        }

        return this.instance
    }
}

class PlayerData {
    static instance: any = null
    flags: any

    constructor() {
        this.flags = []
    }

    addFlag(flag: Flag) {
        if(this.hasFlag(flag)) {
            return
        }

        this.flags.push(flag)
    }

    removeFlag(flag: Flag) {
        for(let i = 0; i < this.flags.length; i++) {
            if(this.flags[i] == flag) {
                this.flags.splice(i, 1)
                return
            }
        }
    }

    hasFlag(flag: Flag) {
        for(let i = 0; i < this.flags.length; i++) {
            if(this.flags[i] == flag) {
                return true
            }
        }

        return false
    }

    static getInstance() {
        if(this.instance == null) {
            this.instance = new PlayerData()
        }

        return this.instance
    }
}

class Obelisk {
    entity: Entity
    ruby: Entity
    emerald: Entity
    sapphire: Entity
    diamond: Entity
    objectiveCount = 0
    bridge: Entity

    constructor(bridge: Entity) {
        this.bridge = bridge

        this.initEntity()
        this.initGems()
    }

    playSound() {
        AudioSource.getMutable(this.entity).playing = true
    }

    initEntity() {
        this.entity = engine.addEntity()
        GltfContainer.create(this.entity, {
            src: 'models/obelisk.glb',
        })
        Transform.create(this.entity, {
            position: Vector3.create(-12.26, 19.3, -58.21),
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.entity,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click" },
            },
            this.handleObeliskClick.bind(this)
        )
        AudioSource.create(this.entity, {
            audioClipUrl: 'sfx/rock.wav',
            loop: false,
            playing: false
        })
    }

    initGems() {
        const baseOffset = 0.7
        const yOffset = 2
        const scale = Vector3.create(0.25, 0.25, 0.25)

        this.ruby = engine.addEntity()
        GltfContainer.create(this.ruby, {
            src: 'models/ruby2.glb',
        })
        Transform.create(this.ruby, {
            parent: this.entity,
            position: Vector3.create(baseOffset, yOffset, 0),
            scale,
            rotation: Quaternion.fromEulerDegrees(-90, 0, -90),
        })
        VisibilityComponent.create(this.ruby, {visible: false})

        this.emerald = engine.addEntity()
        GltfContainer.create(this.emerald, {
            src: 'models/emerald2.glb',
        })
        Transform.create(this.emerald, {
            parent: this.entity,
            position: Vector3.create(-baseOffset, yOffset, 0),
            scale,
            rotation: Quaternion.fromEulerDegrees(90, 0, 90),
        })
        VisibilityComponent.create(this.emerald, {visible: false})

        this.sapphire = engine.addEntity()
        GltfContainer.create(this.sapphire, {
            src: 'models/sapphire2.glb',
        })
        Transform.create(this.sapphire, {
            parent: this.entity,
            position: Vector3.create(0, yOffset, baseOffset),
            scale,
            rotation: Quaternion.fromEulerDegrees(90, 0, 0)
        })
        VisibilityComponent.create(this.sapphire, {visible: true})

        this.diamond = engine.addEntity()
        GltfContainer.create(this.diamond, {
            src: 'models/diamond2.glb',
        })
        Transform.create(this.diamond, {
            parent: this.entity,
            position: Vector3.create(0, yOffset, -baseOffset),
            scale,
            rotation: Quaternion.fromEulerDegrees(-90, 0, 0),
        })
        VisibilityComponent.create(this.diamond, {visible: false})
    }

    handleObeliskClick() {
        const inventory = Inventory.getInstance()

        if(inventory.hasItem(Item.DIAMOND)) {
            VisibilityComponent.getMutable(this.diamond).visible = true
            inventory.removeItem(Item.DIAMOND)
            this.objectiveCount += 1
        }

        if(inventory.hasItem(Item.RUBY)) {
            VisibilityComponent.getMutable(this.ruby).visible = true
            inventory.removeItem(Item.RUBY)
            this.objectiveCount += 1
        }

        if(inventory.hasItem(Item.SAPPHIRE)) {
            VisibilityComponent.getMutable(this.sapphire).visible = true
            inventory.removeItem(Item.SAPPHIRE)
            this.objectiveCount += 1
        }

        if(inventory.hasItem(Item.EMERALD)) {
            VisibilityComponent.getMutable(this.emerald).visible = true
            inventory.removeItem(Item.EMERALD)
            this.objectiveCount += 1
        }

        if(this.objectiveCount <= 0) {
            return
        }

        this.playSound()

        Transform.getMutable(this.bridge).position = Vector3.create(-18, 22.24, -33)
        Transform.getMutable(this.bridge).rotation = Quaternion.fromEulerDegrees(0, -90, 0)

        PlayerData.getInstance().addFlag(Flag.OBELISK_PUZZLE_DONE)
    }
}

class DreamCatcherBlock {
    block
    dreamcatcher1
    dreamcatcher2

    constructor() {
        this.block = engine.addEntity()

        Transform.create(this.block, {
            position: Vector3.create(57.91, 23.30, 19.14),
            scale: Vector3.create(0.5, 0.5, 0.5),
            rotation: Quaternion.fromEulerDegrees(0, -90 , 0)
        })
        GltfContainer.create(this.block, {
            src: 'models/dreamcatcherBlock2.glb',
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.block,
                opts: { 
                    button: InputAction.IA_POINTER,
                    hoverText:"Click",
                    maxDistance: 5,
                },
            },
            this.onPointerDown.bind(this)
        )

        this.dreamcatcher1 = engine.addEntity()
        Transform.create(this.dreamcatcher1, {
            parent: this.block,
            position: Vector3.create(-2.21, 0, 0.07),
        })
        GltfContainer.create(this.dreamcatcher1, {
            src: 'models/dreamcatcher_noCollider.glb',
        })
        VisibilityComponent.create(this.dreamcatcher1, {visible: false})

        this.dreamcatcher2 = engine.addEntity()
        Transform.create(this.dreamcatcher2, {
            parent: this.block,
            position: Vector3.create(2.21, 0, 0.07),
        })
        GltfContainer.create(this.dreamcatcher2, {
            src: 'models/dreamcatcher_noCollider.glb',
        })
        VisibilityComponent.create(this.dreamcatcher2, {visible: false})
    }

    onPointerDown() {
        const dreamcatcherCount = Inventory.getInstance().getItemCount(Item.DREAMCATCHER)

        if(dreamcatcherCount >= 1) {
            VisibilityComponent.getMutable(this.dreamcatcher1).visible = true
        }

        if(dreamcatcherCount >= 2) {
            VisibilityComponent.getMutable(this.dreamcatcher2).visible = true
        }
    }
}

export class Temple {
    building: Entity
    entranceRightDoor: Entity
    bridgeRoomBackDoor: Entity
    bridgeRoomFrontDoor: Entity
    bridgeRoomLeftDoor: Entity
    bridgeRoomRightDoor: Entity
    bridgeRoomFallCatcher: Entity
    obeliskRoomEntranceDoor: Entity
    obeliskRoomExitDoor: Entity
    leftStatueRoomLeftDoor: Entity
    leftStatueRoomRightDoor: Entity
    rightStatueRoomLeftDoor: Entity
    rightStatueRoomRightDoor: Entity
    treasureRoomEntranceDoor: Entity
    treasureRoomExitDoor: Entity
    longHallwayLeftDoor: Entity
    longHallwayRightDoor: Entity
    longHallwayTrigger: Entity
    crossRoom1EntranceDoor: Entity
    crossRoom1TriggerRoom2: Entity
    crossRoom1TriggerRoom3: Entity
    crossRoom2ExitDoor: Entity
    crossRoom3ExitDoor: Entity
    pillarsRoomEntranceDoor: Entity
    pillarsRoomFallCatcher: Entity
    bridge: Entity
    healthPotion: Entity
    leftStatue: Entity
    leftStatueText: Entity
    rightStatue: Entity
    rightStatueText: Entity
    obelisk: any
    pickableRuby: Entity
    pickableDiamond: Entity
    pickableEmerald: Entity
    statueMessage: any
    isStatueMessageVisible = false
    neatDclAdapter: any
    neatFlappyBird: any
    pillarMinigame: any
    dreamCatcher1: Entity
    dreamCatcher2: Entity
    dreamCatcherBlock: any

    constructor() {
        this.initBuilding()
        this.initEntranceRightDoor()
        this.initBridgeBackDoor()
        this.initBridgeFrontDoor()
        this.initBridgeLeftDoor()
        this.initBridgeRightDoor()
        this.initBridgeRoomFallCatcher()
        this.initObeliskRoomEntranceDoor()
        this.initObeliskRoomExitDoor()
        this.initLeftStatueRoomLeftDoor()
        this.initLeftStatueRoomRightDoor()
        this.initRightStatueRoomLeftDoor()
        this.initRightStatueRoomRightDoor()
        this.initTreasureRoomEntranceDoor()
        this.initTreasureRoomExitDoor()
        this.initLongHallwayLeftDoor()
        this.initLongHallwayRightDoor()
        this.initLongHallwayTrigger()
        this.initCrossRoom1EntranceDoor()
        this.initCrossRoom1TriggerRoom2()
        this.initCrossRoom1TriggerRoom3()
        this.initCrossRoom2ExitDoor()
        this.initCrossRoom3ExitDoor()
        this.initPillarsRoomEntranceDoor()
        this.initPillarsRoomFallCatcher()
        this.initBridge()
        this.initHealthPotion()
        this.initStatues()
        this.initNeatSystem()
        this.initPickableGems()
        this.initDreamcatchers()
        // this.initDreamcatcherBlock()
        // this.initStatueMessage()

        this.obelisk = new Obelisk(this.bridge)
        this.pillarMinigame = new PillarMinigame(Vector3.create(37, 17.2, -62), 8, 8)
        this.dreamCatcherBlock = new DreamCatcherBlock()
    }

    createBaseDoor() {
        const door = engine.addEntity()

        GltfContainer.create(door, {
            src: 'models/wizards_door.glb',
        })

        AudioSource.create(door, {
            audioClipUrl: 'sfx/door.wav',
            loop: false,
            playing: false
        })

        return door
    }

    createDoorOnPointerDownFunction(door: any, movePlayerToParams: any) {
        return () => {
            AudioSource.getMutable(door).playing = true
            movePlayerTo(movePlayerToParams)
        }
    }

    initBuilding() {
        this.building = engine.addEntity()
        GltfContainer.create(this.building, {
            src: 'models/Temple8.glb',
        })
        Transform.create(this.building, {position: Vector3.create(0, 0, 0)})
    }

    initEntranceRightDoor() {
        this.entranceRightDoor = this.createBaseDoor()
        Transform.create(this.entranceRightDoor, {position: Vector3.create(-56.7, 19.31, 14)})
        pointerEventsSystem.onPointerDown(
            {
                entity: this.entranceRightDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            this.createDoorOnPointerDownFunction(
                this.entranceRightDoor, 
                {newRelativePosition: Vector3.create(-7.4, 22.24, -18)}
            )
        )
    }

    initBridgeBackDoor() {
        // this.bridgeRoomBackDoor = engine.addEntity()
        // GltfContainer.create(this.bridgeRoomBackDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.bridgeRoomBackDoor = this.createBaseDoor()
        Transform.create(this.bridgeRoomBackDoor, {
            position: Vector3.create(-7.4, 21.24, -17.1),
            rotation: Quaternion.fromEulerDegrees(0, 180, 0)
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.bridgeRoomBackDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(-56.7, 20.31, 16.45),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.bridgeRoomBackDoor, 
                {newRelativePosition: Vector3.create(-56.7, 20.31, 16.45)}
            )
        )
    }

    initBridgeFrontDoor() {
        // this.bridgeRoomFrontDoor = engine.addEntity()
        // GltfContainer.create(this.bridgeRoomFrontDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.bridgeRoomFrontDoor = this.createBaseDoor()
        Transform.create(this.bridgeRoomFrontDoor, {
            position: Vector3.create(-7.7, 21.24, -48.7)
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.bridgeRoomFrontDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         // newRelativePosition: Vector3.create(-22.42, 20.29, -60),
            //         newRelativePosition: Vector3.create(-12.22, 20.31, -50.2),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.bridgeRoomFrontDoor, 
                {newRelativePosition: Vector3.create(-12.22, 20.31, -50.2)}
            )
        )
    }

    initBridgeLeftDoor() {
        // this.bridgeRoomLeftDoor = engine.addEntity()
        // GltfContainer.create(this.bridgeRoomLeftDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.bridgeRoomLeftDoor = this.createBaseDoor()
        Transform.create(this.bridgeRoomLeftDoor, {
            position: Vector3.create(9, 21.24, -33),
            rotation: Quaternion.fromEulerDegrees(0, -90, 0)
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.bridgeRoomLeftDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(37.10, 31.42, -23.07),
            //         cameraTarget: Vector3.create(39.35, 31.42, -23.29),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.bridgeRoomLeftDoor, 
                {
                    newRelativePosition: Vector3.create(37.10, 31.42, -23.07),
                    cameraTarget: Vector3.create(39.35, 31.42, -23.29),
                }
            )
        )
    }

    initBridgeRightDoor() {
        // this.bridgeRoomRightDoor = engine.addEntity()
        // GltfContainer.create(this.bridgeRoomRightDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.bridgeRoomRightDoor = this.createBaseDoor()
        Transform.create(this.bridgeRoomRightDoor, {
            position: Vector3.create(-24.5, 21.24, -33),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0)
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.bridgeRoomRightDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(-60, 20.31, -13.73),
            //         cameraTarget: Vector3.create(-53.88, 20.29, -13.64),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.bridgeRoomLeftDoor, 
                {
                    newRelativePosition: Vector3.create(-60, 20.31, -13.73),
                    cameraTarget: Vector3.create(-53.88, 20.29, -13.64),
                }
            )
        )
    }

    initBridgeRoomFallCatcher() {
        this.bridgeRoomFallCatcher = engine.addEntity()

        MeshRenderer.setBox(this.bridgeRoomFallCatcher)
        MeshCollider.setBox(this.bridgeRoomFallCatcher)

        Transform.create(this.bridgeRoomFallCatcher, {
            position: Vector3.create(-7.4, 3, -33),
            scale: Vector3.create(33, 0, 33),
        })

        Material.setPbrMaterial(this.bridgeRoomFallCatcher, {
            albedoColor: Color4.Black(),
        })

        utils.triggers.addTrigger(
            this.bridgeRoomFallCatcher, 
            utils.NO_LAYERS, 
            utils.LAYER_1, 
            [{
                type: 'box', 
                position: Vector3.create(0, 2, 0),
                scale: Vector3.create(33, 2, 33),
            }], 
            this.bridgeRoomFallCatcherTriggerFunction.bind(this)
        )
    }

    bridgeRoomFallCatcherTriggerFunction() {
        if(PlayerData.getInstance().hasFlag(Flag.OBELISK_PUZZLE_DONE)) {
            movePlayerTo({
                newRelativePosition: Vector3.create(-23, 22.24, -33),
                cameraTarget: Vector3.create(-15.4, 21.31, -33),
            })

            return
        }

        movePlayerTo({
            newRelativePosition: Vector3.create(-7.4, 22.24, -18),
            cameraTarget: Vector3.create(-7.44, 22.24, -19.81),
        })
    }

    initObeliskRoomEntranceDoor() {
        // this.obeliskRoomEntranceDoor = engine.addEntity()
        // GltfContainer.create(this.obeliskRoomEntranceDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.obeliskRoomEntranceDoor = this.createBaseDoor()
        Transform.create(this.obeliskRoomEntranceDoor, {
            position: Vector3.create(-12.22, 19.29, -50.2)
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.obeliskRoomEntranceDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(-7.7, 22.24, -47.45),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.obeliskRoomEntranceDoor, 
                {
                    newRelativePosition: Vector3.create(-7.7, 22.24, -47.45),
                }
            )
        )
    }

    initObeliskRoomExitDoor() {
        // this.obeliskRoomExitDoor = engine.addEntity()
        // GltfContainer.create(this.obeliskRoomExitDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.obeliskRoomExitDoor = this.createBaseDoor()
        Transform.create(this.obeliskRoomExitDoor, {
            position: Vector3.create(-20.36, 19.29, -58),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0)
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.obeliskRoomExitDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(-23.42, 20.29, -60),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.obeliskRoomExitDoor, 
                {
                    newRelativePosition: Vector3.create(-23.42, 20.29, -60),
                }
            )
        )
    }

    initLeftStatueRoomLeftDoor() {
        // this.leftStatueRoomLeftDoor = engine.addEntity()
        // GltfContainer.create(this.leftStatueRoomLeftDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.leftStatueRoomLeftDoor = this.createBaseDoor()
        Transform.create(this.leftStatueRoomLeftDoor, {
            position: Vector3.create(-22.1, 19.29, -59.5),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0)
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.leftStatueRoomLeftDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(-19.90, 20.31, -58),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.obeliskRoomExitDoor, 
                {
                    newRelativePosition: Vector3.create(-19.90, 20.31, -58),
                }
            )
        )
    }

    initLeftStatueRoomRightDoor() {
        // this.leftStatueRoomRightDoor = engine.addEntity()
        // GltfContainer.create(this.leftStatueRoomRightDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.leftStatueRoomRightDoor = this.createBaseDoor()
        Transform.create(this.leftStatueRoomRightDoor, {
            position: Vector3.create(-41.3, 19.29, -59.5),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0)
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.leftStatueRoomRightDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(-44.39, 20.29, -46.21),
            //         cameraTarget: Vector3.create(-44.03, 20.31, -35.85),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.leftStatueRoomRightDoor, 
                {
                    newRelativePosition: Vector3.create(-44.39, 20.29, -46.21),
                    cameraTarget: Vector3.create(-44.03, 20.31, -35.85),
                }
            )
        )
    }

    initRightStatueRoomLeftDoor() {
        // this.rightStatueRoomLeftDoor = engine.addEntity()
        // GltfContainer.create(this.rightStatueRoomLeftDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.rightStatueRoomLeftDoor = this.createBaseDoor()
        Transform.create(this.rightStatueRoomLeftDoor, {
            position: Vector3.create(-43.4, 19.29, -59.25),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0),
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.rightStatueRoomLeftDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(-19.90, 20.31, -58),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.rightStatueRoomLeftDoor, 
                {
                    newRelativePosition: Vector3.create(-19.90, 20.31, -58),
                }
            )
        )
    }

    initRightStatueRoomRightDoor() {
        // this.rightStatueRoomRightDoor = engine.addEntity()
        // GltfContainer.create(this.rightStatueRoomRightDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.rightStatueRoomRightDoor = this.createBaseDoor()
        Transform.create(this.rightStatueRoomRightDoor, {
            position: Vector3.create(-62.7, 19.29, -59.2),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0),
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.rightStatueRoomRightDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(-44.39, 20.29, -46.21),
            //         cameraTarget: Vector3.create(-44.03, 20.31, -35.85),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.rightStatueRoomRightDoor, 
                {
                    newRelativePosition: Vector3.create(-44.39, 20.29, -46.21),
                    cameraTarget: Vector3.create(-44.03, 20.31, -35.85),
                }
            )
        )
    }

    initTreasureRoomEntranceDoor() {
        // this.treasureRoomEntranceDoor = engine.addEntity()
        // GltfContainer.create(this.treasureRoomEntranceDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.treasureRoomEntranceDoor = this.createBaseDoor()
        Transform.create(this.treasureRoomEntranceDoor, {
            position: Vector3.create(-44.39, 19.29, -46.5),
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.treasureRoomEntranceDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(-40, 20.31, -59.5),
            //         cameraTarget: Vector3.create(-32.49, 20.29, -59.57),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.treasureRoomEntranceDoor, 
                {
                    newRelativePosition: Vector3.create(-40, 20.31, -59.5),
                    cameraTarget: Vector3.create(-32.49, 20.29, -59.57),
                }
            )
        )
    }

    initTreasureRoomExitDoor() {
        // this.treasureRoomExitDoor = engine.addEntity()
        // GltfContainer.create(this.treasureRoomExitDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.treasureRoomExitDoor = this.createBaseDoor()
        Transform.create(this.treasureRoomExitDoor, {
            position: Vector3.create(-44.39, 19.29, -22.7),
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.treasureRoomExitDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(-60, 20.31, -13.73),
            //         cameraTarget: Vector3.create(-53.88, 20.29, -13.64),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.treasureRoomExitDoor, 
                {
                    newRelativePosition: Vector3.create(-60, 20.31, -13.73),
                    cameraTarget: Vector3.create(-53.88, 20.29, -13.64),
                }
            )
        )
    }

    initLongHallwayLeftDoor() {
        // this.longHallwayLeftDoor = engine.addEntity()
        // GltfContainer.create(this.longHallwayLeftDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.longHallwayLeftDoor = this.createBaseDoor()
        Transform.create(this.longHallwayLeftDoor, {
            position: Vector3.create(58, 19.31, -15.45),
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.longHallwayLeftDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(-44.79, 20.29, -60),
            //         cameraTarget: Vector3.create(-52.26, 20.30, -59.46),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.longHallwayLeftDoor, 
                {
                    newRelativePosition: Vector3.create(-44.79, 20.29, -60),
                    cameraTarget: Vector3.create(-52.26, 20.30, -59.46),
                }
            )
        )
    }

    initLongHallwayRightDoor() {
        // this.longHallwayRightDoor = engine.addEntity()
        // GltfContainer.create(this.longHallwayRightDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.longHallwayRightDoor = this.createBaseDoor()
        Transform.create(this.longHallwayRightDoor, {
            position: Vector3.create(-58.89, 19.29, -15.4),
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.longHallwayRightDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            this.onLongHallwayRightDoorPointerDown.bind(this)
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(-44.39, 20.31, -23.7),
            //         cameraTarget: Vector3.create(-44.11, 21.31, -35.69),
            //     })
            // }
        )
    }

    initLongHallwayTrigger() {
        this.longHallwayTrigger = utils.addTestCube(
            { 
                position: {x: 0, y: 19.31, z: -13.5},
                scale: {x: 0.25, y: 0.1, z: 5},
            },
            undefined, undefined, undefined, undefined,
            true
        )

        Material.setPbrMaterial(this.longHallwayTrigger, {albedoColor: Color4.Blue()})
        
        utils.triggers.addTrigger(
            this.longHallwayTrigger, 
            utils.NO_LAYERS, 
            utils.LAYER_1, 
            [{type: 'box', scale: Vector3.create(1, 1, 10)}],
            function(otherEntity) {
                PlayerData.getInstance().addFlag(Flag.HALLWAY_TRIGGERED)
            }
        )

        // VisibilityComponent.create(this.longHallwayTrigger, { visible: false })
    }

    initCrossRoom1EntranceDoor() {
        // this.crossRoom1EntranceDoor = engine.addEntity()
        // GltfContainer.create(this.crossRoom1EntranceDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.crossRoom1EntranceDoor = this.createBaseDoor()
        Transform.create(this.crossRoom1EntranceDoor, {
            position: Vector3.create(36.6, 30.42, -22.53),
            rotation: Quaternion.fromEulerDegrees(0, -90, 0)
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.crossRoom1EntranceDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(7.6, 22.24, -33),
            //         cameraTarget: Vector3.create(-15.4, 21.31, -33),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.crossRoom1EntranceDoor, 
                {
                    newRelativePosition: Vector3.create(7.6, 22.24, -33),
                    cameraTarget: Vector3.create(-15.4, 21.31, -33),
                }
            )
        )
    }

    initCrossRoom1TriggerRoom2() {
        this.crossRoom1TriggerRoom2 = utils.addTestCube(
            { 
                position: {x: 47.1, y: 31.42, z: -26.18},
                scale: {x: 1, y: 1, z: 1},
            },
            undefined, undefined, undefined, undefined,
            true
        )
        
        utils.triggers.addTrigger(
            this.crossRoom1TriggerRoom2, 
            utils.NO_LAYERS, 
            utils.LAYER_1, 
            [{type: 'box', scale: Vector3.create(10, 1, 1)}],
            function(otherEntity) {
                if (!Transform.has(engine.PlayerEntity)) {
                    return
                }

                const playerPosition = Transform.get(engine.PlayerEntity).position

                movePlayerTo({
                    newRelativePosition: Vector3.create(playerPosition.x, 16.23, playerPosition.z),
                })
            }
        )

        VisibilityComponent.create(this.crossRoom1TriggerRoom2, { visible: false })
    }

    initCrossRoom1TriggerRoom3() {
        this.crossRoom1TriggerRoom3 = utils.addTestCube(
            { 
                position: {x: 41.93, y: 31.42, z: -31.02},
                scale: {x: 1, y: 1, z: 1},
            },
            undefined, undefined, undefined, undefined,
            true
        )
        
        utils.triggers.addTrigger(
            this.crossRoom1TriggerRoom3, 
            utils.NO_LAYERS, 
            utils.LAYER_1, 
            [{type: 'box', scale: Vector3.create(10, 1, 1)}],
            function(otherEntity) {
                if (!Transform.has(engine.PlayerEntity)) {
                    return
                }

                const playerPosition = Transform.get(engine.PlayerEntity).position

                movePlayerTo({
                    newRelativePosition: Vector3.create(playerPosition.x, 2.37, playerPosition.z),
                })
            }
        )

        VisibilityComponent.create(this.crossRoom1TriggerRoom3, { visible: false })
    }

    initCrossRoom2ExitDoor() {
        // this.crossRoom1EntranceDoor = engine.addEntity()
        // GltfContainer.create(this.crossRoom1EntranceDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.crossRoom1EntranceDoor = this.createBaseDoor()
        Transform.create(this.crossRoom1EntranceDoor, {
            position: Vector3.create(38.6, 15.23, -21.08),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0)
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.crossRoom1EntranceDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(21.26, 2, -17.30),
            //         cameraTarget: Vector3.create(-15.4, 21.31, -33),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.crossRoom1EntranceDoor, 
                {
                    newRelativePosition: Vector3.create(21.26, 2, -17.30),
                    cameraTarget: Vector3.create(-15.4, 21.31, -33),
                }
            )
        )
    }

    initCrossRoom3ExitDoor() {
        // this.crossRoom1EntranceDoor = engine.addEntity()
        // GltfContainer.create(this.crossRoom1EntranceDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.crossRoom1EntranceDoor = this.createBaseDoor()
        Transform.create(this.crossRoom1EntranceDoor, {
            position: Vector3.create(45.6, 1.37, -21.08),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0)
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.crossRoom1EntranceDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(33.43, 22.04, -51.26),
            //         cameraTarget: Vector3.create(34.48, 22.04, -51.26),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.crossRoom1EntranceDoor, 
                {
                    newRelativePosition: Vector3.create(33.43, 22.04, -51.26),
                    cameraTarget: Vector3.create(34.48, 22.04, -51.26),
                }
            )
        )
    }

    initPillarsRoomEntranceDoor() {
        // this.pillarsRoomEntranceDoor = engine.addEntity()
        // GltfContainer.create(this.pillarsRoomEntranceDoor, {
        //     src: 'models/wizards_door.glb',
        // })
        this.pillarsRoomEntranceDoor = this.createBaseDoor()
        Transform.create(this.pillarsRoomEntranceDoor, {
            position: Vector3.create(33, 21.04, -51.26),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0)
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.pillarsRoomEntranceDoor,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            // function() {
            //     movePlayerTo({
            //         newRelativePosition: Vector3.create(45.6, 2.37, -22.08),
            //         cameraTarget: Vector3.create(-15.4, 21.31, -33),
            //     })
            // }
            this.createDoorOnPointerDownFunction(
                this.crossRoom1EntranceDoor, 
                {
                    newRelativePosition: Vector3.create(45.6, 2.37, -22.08),
                    cameraTarget: Vector3.create(-15.4, 21.31, -33),
                }
            )
        )
    }

    initPillarsRoomFallCatcher() {
        this.pillarsRoomFallCatcher = engine.addEntity()

        MeshRenderer.setBox(this.pillarsRoomFallCatcher)
        MeshCollider.setBox(this.pillarsRoomFallCatcher)

        Transform.create(this.pillarsRoomFallCatcher, {
            position: Vector3.create(48.73, 3, -51.22),
            scale: Vector3.create(33, 2, 33),
        })

        Material.setPbrMaterial(this.pillarsRoomFallCatcher, {
            albedoColor: Color4.Black(),
        })

        utils.triggers.addTrigger(
            this.pillarsRoomFallCatcher, 
            utils.NO_LAYERS, 
            utils.LAYER_1, 
            [{
                type: 'box', 
                position: Vector3.create(0, 2, 0),
                scale: Vector3.create(33, 2, 33),
            }], 
            this.pillarsRoomFallCatcherTriggerFunction.bind(this)
        )
    }

    pillarsRoomFallCatcherTriggerFunction() {
        movePlayerTo({
            newRelativePosition: Vector3.create(33.43, 22.04, -51.26),
            cameraTarget: Vector3.create(34.84, 22.04, -51.33),
        })

        this.pillarMinigame.reset()
    }

    initBridge() {
        // Back platform position
        // Vector3.create(-7.4, 22.24, -22)
        this.bridge = engine.addEntity()
        GltfContainer.create(this.bridge, {
            src: 'models/puzzle_room.glb',
        })
        Transform.create(this.bridge, {
            position: Vector3.create(-7.4, 10.24, -29.45),
            scale: Vector3.create(2, 2, 2)
        })
        AudioSource.create(this.bridge, {
            audioClipUrl: 'sfx/rock.wav',
            loop: false,
            playing: false
        })
        Animator.create(this.bridge, {
            states:[
                {
                    name: "backWallBridge",
                    clip: "BackWallBridge",
                    playing: false,
                    loop: false
                },
                {
                    name: "frontWallBridge",
                    clip: "FrontWallBridge",
                    playing: false,
                    loop: false
                },
                {
                    name: "leftWallBridge",
                    clip: "LeftWallBridge",
                    playing: false,
                    loop: false
                },
                {
                    name: "rightWallBridge",
                    clip: "RightWallBridge",
                    playing: false,
                    loop: false
                },
                {
                    name: "roofBridge",
                    clip: "RoofBridge",
                    playing: false,
                    loop: false
                },
            ]
        })
        // pointerEventsSystem.onPointerDown(
        //     {
        //         entity: this.bridge,
        //         opts: { button: InputAction.IA_POINTER, hoverText:"Click" },
        //     },
        //     this.onBridgePointerDown.bind(this)
        // )
    }

    initHealthPotion() {
        this.healthPotion = engine.addEntity()
        GltfContainer.create(this.healthPotion, {
            src: 'models/health_potion.glb',
        })
        Transform.create(this.healthPotion, {position: Vector3.create(-7.4, 18.24, -19)})
        VisibilityComponent.create(this.healthPotion)
        utils.perpetualMotions.startRotation(this.healthPotion, Quaternion.fromEulerDegrees(0, 45, 0))
        pointerEventsSystem.onPointerDown(
            {
                entity: this.healthPotion,
                opts: { 
                    button: InputAction.IA_POINTER, 
                    hoverText:"Click",
                    maxDistance: 15,
                },
            },
            this.onHealthPotionPointerDown.bind(this)
        )
    }

    initStatues() {
        this.leftStatue = engine.addEntity()
        GltfContainer.create(this.leftStatue, {
            src: 'models/flappy_statue.glb',
        })
        Transform.create(this.leftStatue, {
            position: Vector3.create(-31.7, 19.35, -64),
            scale: Vector3.create(2, 2, 2),
        })

        this.leftStatueText = engine.addEntity()
        Transform.create(this.leftStatueText, {
            parent: this.leftStatue,
            position: Vector3.create(0, 0.23, 0.85),
            scale: Vector3.create(0.15, 0.15, 0.15),
            rotation: Quaternion.fromEulerDegrees(20, 180, 0)
        })
        TextShape.create(this.leftStatueText, {
            text: "00"
        })

        this.rightStatue = engine.addEntity()
        GltfContainer.create(this.rightStatue, {
            src: 'models/flappy_statue.glb',
        })
        Transform.create(this.rightStatue, {
            position: Vector3.create(-53, 19.35, -63.6),
            scale: Vector3.create(2, 2, 2)
        })

        this.rightStatueText = engine.addEntity()
        Transform.create(this.rightStatueText, {
            parent: this.rightStatue,
            position: Vector3.create(0, 0.23, 0.85),
            scale: Vector3.create(0.15, 0.15, 0.15),
            rotation: Quaternion.fromEulerDegrees(20, 180, 0)
        })
        TextShape.create(this.rightStatueText, {
            text: "00"
        })
    }

    initStatueMessage() {
        ReactEcsRenderer.setUiRenderer(() => (
            <UiEntity uiTransform={{ width: 700, height: 400 }} >
                <Label
                    value="This is a label"
                    color={Color4.Red()}
                    fontSize={29}
                    font="serif"
                    textAlign="top-left"
                />
            </UiEntity>
        ))
    }

    initNeatSystem() {
        this.neatDclAdapter = new NeatFlappyBirdDclAdapter(
          Vector3.create(15, 2.5, 19),
          1,
          Vector3.create(16, 8, 0)
        )
        this.neatFlappyBird = new NeatFlappyBird(this.neatDclAdapter)

        this.neatFlappyBird.loop(this.neatIterationFinishedCallback.bind(this))
    }

    initPickableGems() {
        const scale = Vector3.create(0.25, 0.25, 0.25)

        this.pickableRuby = engine.addEntity()
        GltfContainer.create(this.pickableRuby, {
            src: 'models/ruby2.glb',
        })
        Transform.create(this.pickableRuby, {
            position: Vector3.create(-45, 20.5, -31.36),
            scale,
            rotation: Quaternion.fromEulerDegrees(0, 0, -90),
        })
        VisibilityComponent.create(this.pickableRuby, {visible: true})
        pointerEventsSystem.onPointerDown(
            {
                entity: this.pickableRuby,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            this.onRubyPointerDown.bind(this)
        )
        AudioSource.create(this.pickableRuby, {
            audioClipUrl: 'sfx/gem.wav',
            loop: false,
            playing: false
        })

        this.pickableEmerald = engine.addEntity()
        GltfContainer.create(this.pickableEmerald, {
            src: 'models/emerald2.glb',
        })
        Transform.create(this.pickableEmerald, {
            position: Vector3.create(-36, 20.2, -34.36),
            scale,
            rotation: Quaternion.fromEulerDegrees(90, 0, 90),
        })
        VisibilityComponent.create(this.pickableEmerald, {visible: true})
        pointerEventsSystem.onPointerDown(
            {
                entity: this.pickableEmerald,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            this.onEmeraldPointerDown.bind(this)
        )
        AudioSource.create(this.pickableEmerald, {
            audioClipUrl: 'sfx/gem.wav',
            loop: false,
            playing: false
        })

        this.pickableDiamond = engine.addEntity()
        GltfContainer.create(this.pickableDiamond, {
            src: 'models/diamond2.glb',
        })
        Transform.create(this.pickableDiamond, {
            position: Vector3.create(-53, 20.12, -27.36),
            scale,
            rotation: Quaternion.fromEulerDegrees(-47, 16, 0),
        })
        VisibilityComponent.create(this.pickableDiamond, {visible: true})
        pointerEventsSystem.onPointerDown(
            {
                entity: this.pickableDiamond,
                opts: { button: InputAction.IA_POINTER, hoverText:"Click"},
            },
            this.onDiamondPointerDown.bind(this)
        )
        AudioSource.create(this.pickableDiamond, {
            audioClipUrl: 'sfx/gem.wav',
            loop: false,
            playing: false
        })
    }

    initDreamcatchers() {
        const onDreamcatcher1PointerDown = () => {
            Inventory.getInstance().addItem(Item.DREAMCATCHER)
            engine.removeEntity(this.dreamCatcher1)

            if(Inventory.getInstance().getItemCount(Item.DREAMCATCHER) >= 2) {
                movePlayerTo({
                    newRelativePosition: Vector3.create(0, 20.24, 3.6),
                    cameraTarget: Vector3.create(0, 20.24, 7.63),
                })

                return
            }

            movePlayerTo({
                newRelativePosition: Vector3.create(7.6, 22.24, -33),
                cameraTarget: Vector3.create(6.85, 22.24, -32.99),
            })
        }

        const onDreamcatcher2PointerDown = () => {
            Inventory.getInstance().addItem(Item.DREAMCATCHER)
            engine.removeEntity(this.dreamCatcher2)

            if(Inventory.getInstance().getItemCount(Item.DREAMCATCHER) >= 2) {
                movePlayerTo({
                    newRelativePosition: Vector3.create(0, 20.24, 3.6),
                    cameraTarget: Vector3.create(0, 20.24, 7.63),
                })

                return
            }

            movePlayerTo({
                newRelativePosition: Vector3.create(7.6, 22.24, -33),
                cameraTarget: Vector3.create(6.85, 22.24, -32.99),
            })
        }

        this.dreamCatcher1 = engine.addEntity()

        Transform.create(this.dreamCatcher1, {
            position: Vector3.create(20.64, 33.14, -46.34),
            scale: Vector3.create(0.25, 0.25, 0.25),
        })
        GltfContainer.create(this.dreamCatcher1, {
            src: 'models/dreamcatcher.glb',
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.dreamCatcher1,
                opts: { 
                    button: InputAction.IA_POINTER,
                    hoverText:"Click",
                    maxDistance: 5,
                },
            },
            onDreamcatcher1PointerDown
        )

        this.dreamCatcher2 = engine.addEntity()

        Transform.create(this.dreamCatcher2, {
            position: Vector3.create(59, 23.04, -51.26),
            scale: Vector3.create(0.25, 0.25, 0.25),
            rotation: Quaternion.fromEulerDegrees(0, 90, 0)
        })
        GltfContainer.create(this.dreamCatcher2, {
            src: 'models/dreamcatcher.glb',
        })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.dreamCatcher2,
                opts: { 
                    button: InputAction.IA_POINTER,
                    hoverText:"Click",
                    maxDistance: 5,
                },
            },
            onDreamcatcher2PointerDown
        )
    }

    neatIterationFinishedCallback() {
        let generation = parseInt(TextShape.get(this.leftStatueText).text) + 1

        if(generation > 99) {
            generation = 0
        }

        TextShape.getMutable(this.leftStatueText).text = "" + generation
        TextShape.getMutable(this.rightStatueText).text = "" + generation
    }

    onRubyPointerDown() {
        Inventory.getInstance().addItem(Item.RUBY)
        VisibilityComponent.getMutable(this.pickableRuby).visible = false
        AudioSource.getMutable(this.pickableRuby).playing = true
    }

    onDiamondPointerDown() {
        Inventory.getInstance().addItem(Item.DIAMOND)
        VisibilityComponent.getMutable(this.pickableDiamond).visible = false
        AudioSource.getMutable(this.pickableDiamond).playing = true
    }

    onEmeraldPointerDown() {
        Inventory.getInstance().addItem(Item.EMERALD)
        VisibilityComponent.getMutable(this.pickableEmerald).visible = false
        AudioSource.getMutable(this.pickableEmerald).playing = true
    }
    
    onHealthPotionPointerDown() {
        // Back platform position
        // Vector3.create(-7.4, 22.24, -22)
        const startPosition = Transform.get(this.bridge).position
        const endPosition = Vector3.create(-7.4, 22.24, -23)

        VisibilityComponent.getMutable(this.healthPotion).visible = false

        utils.tweens.startTranslation(
            this.bridge, 
            startPosition, 
            endPosition, 
            2,  
            utils.InterpolationType.LINEAR,
            () => {
                const states = Animator.getMutable(this.bridge).states
                states.forEach(state => {
                    state.playing = true
                })
            }
        )

        // const states = Animator.getMutable(this.bridge).states
        // states.forEach(state => {
        //     state.playing = true
        // })
    }

    onStatuePointerDown() {
        this.isStatueMessageVisible = true
    }

    // PlayerData.getInstance().addFlag(Flag.HALLWAY_TRIGGERED)

    onLongHallwayRightDoorPointerDown() {
        AudioSource.getMutable(this.longHallwayRightDoor).playing = true

        if(PlayerData.getInstance().hasFlag(Flag.HALLWAY_TRIGGERED)) {
            PlayerData.getInstance().removeFlag(Flag.HALLWAY_TRIGGERED)

            movePlayerTo({
                newRelativePosition: Vector3.create(-23, 22.24, -33),
                cameraTarget: Vector3.create(-15.4, 21.31, -33),
            })

            return
        }

        movePlayerTo({
            newRelativePosition: Vector3.create(-44.39, 20.31, -23.7),
            cameraTarget: Vector3.create(-44.11, 21.31, -35.69),
        })
    }
}
import {
    Entity,
    engine,
    Transform,
    MeshRenderer,
    MeshCollider
} from '@dcl/sdk/ecs'
import { Cube, Plane, Sphere } from './components'
import { Vector3 } from '@dcl/sdk/math'
  
export function createCube(position: Vector3): Entity {
    const meshEntity = engine.addEntity()

    // Used to track the cubes
    Cube.create(meshEntity)

    Transform.create(meshEntity, { position })
    // set how the cube looks and collides
    MeshRenderer.setBox(meshEntity)
    MeshCollider.setBox(meshEntity)

    return meshEntity
}

export function createPlane(position: Vector3): Entity {
    const meshEntity = engine.addEntity()

    // Used to track the cubes
    Plane.create(meshEntity)

    Transform.create(meshEntity, { position })
    // set how the cube looks and collides
    MeshRenderer.setPlane(meshEntity)
    MeshCollider.setPlane(meshEntity)

    return meshEntity
}

export function createSphere(position: Vector3): Entity {
    const meshEntity = engine.addEntity()

    Sphere.create(meshEntity)
    Transform.create(meshEntity, { position })
    MeshRenderer.setSphere(meshEntity)
    MeshCollider.setSphere(meshEntity)

    return meshEntity
}
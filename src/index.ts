import { CameraModeArea, CameraType, InputAction, PointerEventType, Transform, engine, inputSystem } from "@dcl/sdk/ecs";
import { Temple } from "./temple";
import { Vector3 } from "@dcl/sdk/math";
import { onSceneReadyObservable } from "@dcl/sdk/observables";
import { movePlayerTo } from "~system/RestrictedActions";

export function main() {
  const temple = new Temple()
  const entity = engine.addEntity()

  CameraModeArea.create(entity, {
    area: Vector3.create(176, 50, 176),
    mode: CameraType.CT_FIRST_PERSON,
  })

  Transform.create(entity, {position: Vector3.create(0, 0, 0)})

  engine.addSystem(() => {
    if (inputSystem.isTriggered(InputAction.IA_SECONDARY, PointerEventType.PET_DOWN)){
      movePlayerTo({
        newRelativePosition: Vector3.create(0, 20.31, 23),
        cameraTarget: Vector3.create(0, 20.31, 18)
      })
    }
})
}

import { CameraModeArea, CameraType, Transform, engine } from "@dcl/sdk/ecs";
import { Temple } from "./temple";
import { Vector3 } from "@dcl/sdk/math";

export function main() {
  const temple = new Temple()
  const entity = engine.addEntity()

  CameraModeArea.create(entity, {
    area: Vector3.create(176, 50, 176),
    mode: CameraType.CT_FIRST_PERSON,
  })

  Transform.create(entity, {position: Vector3.create(0, 0, 0)})
}

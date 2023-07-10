import { 
    Entity, 
    Material, 
    MeshCollider, 
    MeshRenderer, 
    TextureFilterMode, 
    TextureWrapMode, 
    Transform, 
    engine 
} from "@dcl/sdk/ecs";
import { Color3, Vector3 } from "@dcl/sdk/math";
import { PixelPlane } from "./pixelPlane";

export class PixelPlaneImage {
    containerEntity: Entity
    pixelPlanes: Array<PixelPlane> = []

    constructor(position: Vector3, scale: Vector3, byteArrayImage: {width: number, height: number, bytes: Array<number>}){
        let pixelPlane
        let pixelPlanePosition
        let r, g, b
        let currentPixelIndex = 0
        let currentPixel

        this.containerEntity = engine.addEntity()
        Transform.create(this.containerEntity, {
            position: position,
            scale: scale,
        })

        for(let y = 0; y < byteArrayImage.height; y++){
            for(let x = 0; x < byteArrayImage.width; x++){
                currentPixel = byteArrayImage.bytes[currentPixelIndex]
                currentPixelIndex += 1
                r = currentPixel >> 16
                g = currentPixel >> 8
                b = currentPixel & 0x000000FF

                pixelPlanePosition = Vector3.create(x,-y, 0)
                pixelPlane = new PixelPlane(pixelPlanePosition, Color3.create(r, g, b))
                Transform.getMutable(pixelPlane.getEntity()).parent = this.containerEntity

                this.pixelPlanes.push(pixelPlane)
            }
        }
    }
}
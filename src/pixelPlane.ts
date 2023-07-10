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
import { createPlane } from "./misc";
import { Plane } from "./components";

export class PixelPlane {
    plane: Entity
    scale: number
    static texture = Material.Texture.Common({
        src: 'images/pixel_map3.png',
        // src: 'images/style1.jpg',
        // wrapMode: TextureWrapMode.TWM_REPEAT
        // filterMode: TextureFilterMode.TFM_POINT,
    })
    static material = {texture: this.texture}

    constructor(position: Vector3, color: Color3, scale: number = 1){
        this.scale = scale
        this.plane = engine.addEntity()

        Plane.create(this.plane)
        Transform.create(this.plane, { position })
        MeshRenderer.setPlane(this.plane, this.getColorPlaneUV(color))
        MeshCollider.setPlane(this.plane)
        Material.setBasicMaterial(this.plane, PixelPlane.material)
    }

    /*
        first offset in pixels (o1) = b * 65536 
        second offset in pixels (o2) = g * 256
        third offset in pixels (o3)= r
        total number of pixels (tp) = o1 + o2 + o3
        pixel row (pr) = floor(tp / 5000)
        pixel column (pc) = mod(tp / 5000)
        initial u (iu) = pc * 0.0002
        initial v (iv) = pr * 0.0002
        final u = iu + 0.00019
        final v = iv + 0.00019
    */
   getColorPlaneUV(color: Color3) {
        const pixelCount = color.b * 65536 + color.g * 256 + color.r
        const pixelRow = Math.floor(pixelCount / 5000)
        const pixelColumn = pixelCount % 5000

        // if(pixelCount < 5000) {
        //     pixelColumn = pixelCount
        // }

        // const initialU = pixelColumn * 0.0002
        // const initialV = pixelRow * 0.0002
        // const finalU = initialU + 0.00019
        // const finalV = initialV + 0.00019
        const initialU = pixelColumn * 0.0002
        const initialV = pixelRow * 0.0002
        const finalU = initialU //+ 0.00019
        const finalV = initialV //+ 0.00019

        console.log([initialU, initialV, finalU, finalV])

        return [
            initialU, initialV,
            initialU, finalV,
            finalU, finalV,
            finalU, initialV,

            initialU, initialV,
            initialU, finalV,
            finalU, finalV,
            finalU, initialV,
        ]

        // return [
        //     initialU, initialV,
        //     initialU, finalV,
        //     finalU, finalV,
        //     finalU, initialV,

        //     initialU, initialV,
        //     initialU, finalV,
        //     finalU, finalV,
        //     finalU, initialV,
        // ]
   }

   getSize() {
        return this.scale    
   }

   getEntity() {
        return this.plane
   }

   setScale(scale: number) {
        this.scale = scale
   }
}
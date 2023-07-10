import { bread } from "./byteArrayImages";
import * as ort from 'onnxruntime-web';

// execute().catch(console.error);

// async function execute() {
//   let image = await Image.load('cat.jpg');
//   let grey = image
//     .grey() // convert the image to greyscale.
//     .resize({ width: 200 }) // resize the image, forcing a width of 200 pixels. The height is computed automatically to preserve the aspect ratio.
//     .rotate(30); // rotate the image clockwise by 30 degrees.
//   return grey.save('cat.png');
// }

export function preProcessImage(image: {width: number, height: number, bytes: Array<number>}) {
    // from PIL import Image
    // import numpy as np

    // # loading input and resize if needed
    // image = Image.open("PATH TO IMAGE")
    // size_reduction_factor = 1
    // image = image.resize((int(image.size[0] / size_reduction_factor), int(image.size[1] / size_reduction_factor)), Image.ANTIALIAS)

    // # Preprocess image
    // x = np.array(image).astype('float32')
    // x = np.transpose(x, [2, 0, 1])
    // x = np.expand_dims(x, axis=0)

    // const onnxArray: Array<Array<Array<number>>> = [[[]]]
    let currentPixelIndex = 0
    let currentPixel
    let r, g, b
    let rgb
    let xArray = []
    let yArray

    for(let x = 0; x < image.width; x++){
        yArray = []

        for(let y = 0; y < image.width; y++){
            currentPixel = image.bytes[currentPixelIndex]
            currentPixelIndex += 1
            r = currentPixel >> 16
            g = currentPixel >> 8
            b = currentPixel & 0x000000FF
            rgb = [
                r = currentPixel >> 16,
                g = currentPixel >> 8,
                b = currentPixel & 0x000000FF
            ]

            yArray.push(rgb)
        }

        xArray.push(yArray)
    }
}

export async function exec() {
    try {
        const image = preProcessImage(bread)

        // const session = await ort.InferenceSession.create('./onnx_models/mosaic-9.onnx')

        // // const dims = [1, 3, 224, 224];
        // const dims = [1, 96, 96, 3]
        // // const size = dims[0] * dims[1] * dims[2] * dims[3];
        // // const inputData = Float32Array.from({ length: size }, () => Math.random());

        // const feeds = { input1: new ort.Tensor('int32', bread.bytes, dims) }

        // const results = await session.run(feeds)
        // console.log(results)
        // console.log(results.output1)
        // console.log(results.output1.data)
    }
    catch(e) {
        console.log("An erro has ocurred")
        // console.log(e.toString())
    }
}
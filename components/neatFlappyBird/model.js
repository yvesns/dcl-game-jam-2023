// const { Neat } = require("../neat/neat")
import { NEAT } from "../neat/neat"
// import activation from "../neat/neat"
// import crossover from "../neat/neat"
// import mutate from "../neat/neat"
import * as activation from "../neat/ActivationFunction"
import * as crossover from "../neat/Crossover"
import * as mutate from "../neat/Mutate"
import Bird from "./bird"
import Pipe from "./pipe"

// import * as activation from "../neat/ActivationFunction"
// import * as crossover from "../neat/Crossover"
// import * as mutate from "../neat/Mutate"

export class NeatFlappyBirdModel {
    TOTAL = 1
    birds = []
    pipes = []
    counter = 0
    iterations = 1
    neat
    config = {
        model: [
            {nodeCount: 5, type: "input"},
            {nodeCount: 2, type: "output", activationfunc: activation.SOFTMAX}
        ],
        mutationRate: 0.1,
        crossoverMethod: crossover.RANDOM,
        mutationMethod: mutate.RANDOM,
        populationSize: this.TOTAL
    }

    constructor(iterations) {
        this.iterations = iterations

        for (let i = 0; i < this.TOTAL; i++) {
            this.birds[i] = new Bird()
        }
    
        this.neat = new NEAT(this.config)
    }

    getGeneration() {
        return this.neat.getGeneration()
    }

    getBirds() {
        return this.birds
    }

    getPipes() {
        return this.pipes
    }
    
    createPipe() {
        if (this.counter % 75 == 0) {
            this.pipes.push(new Pipe());
        }
    
        this.counter++;
    }
    
    handlePipeBirdHit(pipe) {
        for (let b = 0; b < this.birds.length; b++) {
            if(pipe.hits(this.birds[b])) {
                this.birds[b].dead = true;
            }
        }
    }   
    
    updatePipes() {
        for (let p = 0; p < this.pipes.length; p++) {
            this.pipes[p].update();
    
            this.handlePipeBirdHit(this.pipes[p])
    
            if (this.pipes[p].offscreen()) {
                this.pipes[p].isValid = false
                this.pipes.splice(p, 1);
            }
        }
    }
    
    updateBirds() {
        for(let b = 0; b < this.birds.length; b++) {
            if(this.birds[b].offScreen()) {
                this.birds[b].dead = true;
            }
        }
    
        for(let bird of this.birds) {
            if(!bird.dead) {
                bird.update()
            }
        }
    }
    
    handleInputs() {
        for(let i = 0; i < this.TOTAL; i++) {
            this.neat.setInputs(this.birds[i].inputss(this.pipes), i);
        }
    
        this.neat.feedForward();
    
        let desicions = this.neat.getDesicions();
    
        for(let i = 0; i < this.TOTAL; i++) {
            if(desicions[i] === 1) {
                this.birds[i].up();
            }
        }
    }
    
    handleFinish() {
        return

        for(let b = 0; b < this.birds.length; b++) {
            if(!this.birds[b].dead) {
                // console.log("Bird is dead, ending game.")
                return
            }
        }

        for (let p = 0; p < this.pipes.length; p++) {
            this.pipes[p].isValid = false
        }
    
        this.counter = 0;
        this.pipes = [];
    
        for (let b = 0; b < this.TOTAL; b++) {
            this.neat.setFitness(this.birds[b].score, b);
            this.birds[b] = new Bird();
        }
        
        this.neat.doGen();
    }
    
    execute() {
        for(let i = 0; i < this.iterations; i++) {
            this.createPipe()
            this.updatePipes()
            this.updateBirds()
            this.handleInputs()
            this.handleFinish()
        }

        // console.log("done")
    
        // All the drawing stuff
        // background(0);
    
        // for (let bird of this.birds) {
        //     bird.show();
        // }
    
        // for (let pipe of this.pipes) {
        //     pipe.show();
        // }
    }
}

// const this.TOTAL = 1000;

// let this.birds = [];
// let this.pipes = [];
// let counter = 0;
// let slider;
// let this.neat;
// let config = {
// 	model: [
// 		{nodeCount: 5, type: "input"},
// 		{nodeCount: 2, type: "output", activationfunc: activation.SOFTMAX}
// 	],
// 	mutationRate: 0.1,
// 	crossoverMethod: crossover.RANDOM,
// 	mutationMethod: mutate.RANDOM,
// 	populationSize: this.TOTAL
// };

// function setup() {
//     createCanvas(640, 480);
//     slider = createSlider(1, 10, 1);

//     for (let i = 0; i < this.TOTAL; i++) {
//         this.birds[i] = new Bird();
//     }

//     this.neat = new this.neat(config);
// }

// function createPipe() {
//     if (counter % 75 == 0) {
//         this.pipes.push(new Pipe());
//     }

//     counter++;
// }

// function handlePipeBirdHit(pipe) {
//     for (let b = 0; b < this.birds.length; b++) {
//         if(pipe.hits(this.birds[b])) {
//             this.birds[b].dead = true;
//         }
//     }
// }   

// function updatePipes() {
//     for (let p = 0; p < this.pipes.length; p++) {
//         this.pipes[p].update();

//         handlePipeBirdHit(this.pipes[p])

//         if (this.pipes[p].offscreen()) {
//             this.pipes.splice(p, 1);
//         }
//     }
// }

// function updateBirds() {
//     for(let b = 0; b < this.birds.length; b++) {
//         if(this.birds[b].offScreen()) {
//             this.birds[b].dead = true;
//         }
//     }

//     for(let bird of this.birds) {
//         if(!bird.dead) {
//             bird.update()
//         }
//     }
// }

// function handleInputs() {
//     for(let i = 0; i < this.TOTAL; i++) {
//         this.neat.setInputs(this.birds[i].inputss(this.pipes), i);
//     }

//     this.neat.feedForward();

//     let desicions = this.neat.getDesicions();

//     for(let i = 0; i < this.TOTAL; i++) {
//         if(desicions[i] === 1) {
//             this.birds[i].up();
//         }
//     }
// }

// function handleFinish() {
//     for(let b = 0; b < this.birds.length; b++) {
//         if(!this.birds[b].dead) {
//             return
//         }
//     }

//     counter = 0;
//     this.pipes = [];

//     for (let b = 0; b < this.TOTAL; b++) {
//         this.neat.setFitness(this.birds[b].score, b);
//         this.birds[b] = new Bird();
//     }
    
//     this.neat.doGen();
// }

// function execute() {
//     for(let n = 0; n < slider.value(); n++) {
//         createPipe()
//         updatePipes()
//         updateBirds()
//         handleInputs()
//         handleFinish()
//     }

//     // All the drawing stuff
//     // background(0);

//     // for (let bird of this.birds) {
//     //     bird.show();
//     // }

//     // for (let pipe of this.pipes) {
//     //     pipe.show();
//     // }
// }
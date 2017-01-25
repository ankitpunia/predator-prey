import sketch from './sketch';
import DNA from './dna';
import NeuralNetwork from './neuralnetwork';

export default class Being {
  constructor(dna) {
    this.dna = dna || new DNA();

    this.alive = true;
    this.age = 0;
    this.health = 100;
    this.location = sketch.createVector(sketch.random(sketch.width),
      sketch.random(sketch.height));
  }

  overlaps(being) {
    if (this.location.dist(being.location) < (this.size + being.size) / 2) {
      return true;
    }
    return false;
  }

  getDNA() {
    return this.dna;
  }

  update() {
    this.age += 0.01;
    this.health = sketch.constrain(this.health, 0, 100);
    if (this.health <= 0 || this.age >= 100) {
      this.alive = false;
    }
  }
}

export class SensoryBeing extends Being {
  constructor(dna) {
    super(dna);
    // this.sightDist = sketch.random(100, 150);
    this.maxForce = sketch.random(1, 5);
    this.acceleration = sketch.createVector(0, 0);
    this.velocity = sketch.createVector(sketch.random(-2, 2), sketch.random(-2, 2));

    const inputNeurons = 6;
    const hiddenNeurons = [4];
    const outputNeurons = 2;
    const layerNeurons = [inputNeurons, ...hiddenNeurons, outputNeurons];
    let weightsLen = 0;
    for (let i = 1; i < layerNeurons.length; i += 1) {
      weightsLen += layerNeurons[i - 1] * layerNeurons[i];
    }
    const weights = this.dna.genes.slice(0, weightsLen).map(x => sketch.normalize(x));
    this.brain = new NeuralNetwork(inputNeurons, hiddenNeurons, outputNeurons, weights);
  }

  applyForce(force) {
    force.div(this.size * this.size);
    this.acceleration.add(force);
  }

  update(nearestPredator, nearestPrey, nearestTree) {
    super.update(nearestPredator, nearestPrey, nearestTree);

    const brainInput = [];
    brainInput[0] = nearestPredator.location.x - this.location.x;
    brainInput[1] = nearestPrey.location.x - this.location.x;
    brainInput[2] = nearestTree.location.x - this.location.x;

    brainInput[3] = nearestPredator.location.y - this.location.y;
    brainInput[4] = nearestPrey.location.y - this.location.y;
    brainInput[5] = nearestTree.location.y - this.location.y;

    const instinct = sketch.createVector();
    [instinct.x, instinct.y] = this.brain.compute(brainInput);
    instinct.setMag(this.maxForce);
    this.applyForce(instinct);

    // Drag is proportional to area and velocity squared
    const drag = this.velocity.copy();
    drag.mult(-0.01 * this.size * this.velocity.mag());
    this.applyForce(drag);

    this.health -= this.acceleration;

    this.location.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.acceleration.setMag(0);

    // Keep on screen
    this.location.x = (this.location.x + sketch.width) % sketch.width;
    this.location.y = (this.location.y + sketch.height) % sketch.height;
  }
}

export class Predator extends SensoryBeing {
  constructor(dna) {
    super(dna);
    this.color = sketch.color(162, 133, 83);
    this.size = sketch.random(8, 12);
  }

  update(nearestPredator, nearestPrey, nearestTree) {
    super.update(nearestPredator, nearestPrey, nearestTree);
    if (this.overlaps(nearestPrey)) {
      this.health += 25;
    }
    if (this.overlaps(nearestPredator)) {
      return true;
    }
    return false;
  }

  draw() {
    sketch.push();

    sketch.translate(this.location.x, this.location.y);
    sketch.rotate(Math.atan2(this.velocity.y, this.velocity.x));

    sketch.noStroke();
    sketch.fill(this.color, sketch.map(this.age, 0, 100, 64, 255));
    sketch.ellipse(this.size / 2, 0, this.size, this.size);
    sketch.ellipse(-this.size / 2, 0, 1.5 * this.size, 1.5 * this.size);

    sketch.pop();
  }
}

export class Prey extends SensoryBeing {
  constructor(dna) {
    super(dna);
    this.color = sketch.color(203, 202, 89);
    this.size = sketch.random(4, 6);
  }

  update(nearestPredator, nearestPrey, nearestTree) {
    super.update(nearestPredator, nearestPrey, nearestTree);
    if (this.overlaps(nearestPredator)) {
      this.alive = false;
    }
    if (this.overlaps(nearestTree)) {
      this.health += 1;
    }
    if (this.overlaps(nearestPrey)) {
      return true;
    }
    return false;
  }

  draw() {
    sketch.push();

    sketch.translate(this.location.x, this.location.y);
    sketch.rotate(Math.atan2(this.velocity.y, this.velocity.x));

    sketch.noStroke();
    sketch.fill(this.color, sketch.map(this.age, 0, 100, 64, 255));
    sketch.ellipse(this.size / 2, 0, this.size, this.size);
    sketch.ellipse(-this.size / 2, 0, 1.5 * this.size, 1.5 * this.size);

    sketch.pop();
  }
}

export class Tree extends Being {
  constructor(dna) {
    super(dna);
    this.color = sketch.color(38, 148, 46, 128);
    this.size = sketch.random(20, 30);
  }

  update(nearestPredator, nearestPrey, nearestTree) {
    super.update(nearestPredator, nearestPrey, nearestTree);

    this.size = sketch.map(this.health, 100, 0, 50, 20);
    if (this.overlaps(nearestPrey)) {
      this.health -= 1;
    }
  }

  draw() {
    let size = this.size;
    while (size > 10) {
      sketch.fill(this.color);
      sketch.ellipse(this.location.x, this.location.y, size, size);
      size -= 8;
    }
  }
}

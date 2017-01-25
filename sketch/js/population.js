import {
  Predator,
  Prey,
  Tree,
} from './being';
import sketch from './sketch';

const beingClasses = {
  Predator,
  Prey,
  Tree,
};

export default class Population {
  constructor(type = 'Tree', num = 20, mutationRate = 0.01, reproductionRate = 0.01) {
    this.type = type;
    this.beings = [];
    this.mutationRate = mutationRate;
    this.reproductionRate = reproductionRate;

    for (let i = 0; i < num; i += 1) {
      const BeingClass = beingClasses[this.type];
      this.beings[i] = new BeingClass();
    }
  }

  update(predatorPop, preyPop, treePop) {
    for (let i = 0; i < this.beings.length; i += 1) {
      const nearestPredator = predatorPop.nearestBeing(this.beings[i].location);
      const nearestPrey = preyPop.nearestBeing(this.beings[i].location);
      const nearestTree = treePop.nearestBeing(this.beings[i].location);

      const crossedAnotherBeing = this.beings[i].update(nearestPredator, nearestPrey, nearestTree);
      if (crossedAnotherBeing && Math.random() < this.reproductionRate) {
        const child = this.reproduce(this.beings[i], this.constructor.name === 'Predator' ? nearestPredator : nearestPrey);
        this.beings.push(child);
      }
    }

    const lastBeing = this.beings[0];

    for (let i = this.beings.length - 1; i >= 0; i -= 1) {
      if (!this.beings[i].alive) {
        this.beings.splice(i, 1);
      }
    }

    if (this.beings.length === 0) {
      const child = this.reproduce(lastBeing, lastBeing);
      this.beings.push(child);
    }
  }

  draw() {
    sketch.fill(0, 0, 0, 64);
    sketch.textSize(10);
    sketch.textAlign(sketch.LEFT, sketch.TOP);
    sketch.textFont('monospace');

    for (let i = 0; i < this.beings.length; i += 1) {
      this.beings[i].draw();
    }
  }

  nearestBeing(location) {
    let minDist = Math.max(sketch.width, sketch.height);
    let nearestBeing = this.beings[0];

    for (let i = 0; i < this.beings.length; i += 1) {
      if (location !== this.beings[i].location) {
        const dist = location.dist(this.beings[i].location);
        if (dist < minDist) {
          minDist = dist;
          nearestBeing = this.beings[i];
        }
      }
    }

    return nearestBeing;
  }

  reproduce(dad, mom) {
    const childDNA = dad.dna.crossover(mom.dna);
    childDNA.mutate(this.mutationRate);

    const BeingClass = beingClasses[this.type];
    return new BeingClass(childDNA);
  }

}

export class PredatorPopulation extends Population {
  constructor(num = 20, mutationRate = 0.01, reproductionRate = 0.02) {
    super('Predator', num, mutationRate, reproductionRate);
  }
}

export class PreyPopulation extends Population {
  constructor(num = 20, mutationRate = 0.01, reproductionRate = 0.40) {
    super('Prey', num, mutationRate, reproductionRate);
  }
}

export class TreePopulation extends Population {
  constructor(num = 20, mutationRate = 0.01, reproductionRate = 0.00001) {
    super('Tree', num, mutationRate, reproductionRate);
  }

  update() {
    if (Math.random() < this.reproductionRate) {
      this.beings.push(new Tree());
    }
  }
}

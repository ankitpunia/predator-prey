import {
  PredatorPopulation,
  PreyPopulation,
  TreePopulation,
} from './population';
import sketch from './sketch';

export default class World {
  constructor() {
    this.predatorPop = new PredatorPopulation(4);
    this.preyPop = new PreyPopulation(20);
    this.treePop = new TreePopulation(10);
  }

  update() {
    this.predatorPop.update(this.predatorPop, this.preyPop, this.treePop);
    this.preyPop.update(this.predatorPop, this.preyPop, this.treePop);
    this.treePop.update(this.predatorPop, this.preyPop, this.treePop);
  }

  draw() {
    sketch.background(255);
    sketch.noStroke();

    this.predatorPop.draw();
    this.preyPop.draw();
    this.treePop.draw();
  }
}

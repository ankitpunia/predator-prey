// In order to suppress the ESLint errors (Should only be used in the main sketch.js file)
/* eslint new-cap: ["error", { "newIsCapExceptions": ["p5"] }] */
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint-env browser */

// Import modules
import p5 from 'p5';
import World from './world';

export default new p5((sketch) => {
  let world;

  sketch.setup = () => {
    sketch.createCanvas(window.innerWidth, window.innerHeight);

    // Add your code here
    world = new World();
  };

  sketch.draw = () => {
    // Add your code here

    world.update();
    world.draw();
  };

  sketch.mouseDragged = () => {
    // Add your code here
  };

  sketch.keyPressed = () => {
    if (sketch.key === ' ') {
      for (let i = 0; i < 10000; i += 1) {
        world.update();
      }
    }
  };

  sketch.normalize = z => (z * 2) - 1;
});

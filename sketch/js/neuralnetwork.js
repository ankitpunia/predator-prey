import sketch from './sketch';

const activation = z => (1 - Math.exp(-z)) / (1 + Math.exp(-z));

class Neuron {
  constructor(numSynapses = 1, weights = [], value = 0) {
    this.weights = weights;
    this.value = value;

    // Initializing weight with random numbers
    if (arguments.length < 2) {
      for (let i = 0; i < numSynapses; i += 1) {
        this.weights[i] = sketch.normalize(Math.random());
      }
    }
  }
}

class Layer {
  constructor(numNeurons = 1, prevLayerNeurons = 0, layerWeights = []) {
    this.neurons = [];

    for (let i = 0; i < numNeurons; i += 1) {
      const neuronWeights = layerWeights.slice(i * prevLayerNeurons, (i + 1) * prevLayerNeurons);
      this.neurons.push(new Neuron(prevLayerNeurons, neuronWeights));
    }
  }
}

export default class NeuralNetwork {
  constructor(inputNeurons = 1, hiddenNeuronArr = [2], outputNeurons = 1, weights) {
    this.layers = [];

    // Adding the input layer
    this.layers.push(new Layer(inputNeurons));

    let prevLayerNeurons = inputNeurons;
    let weightIndex = 0;
    let layerWeights = [];

    // Adding the hidden layers
    hiddenNeuronArr.forEach((hiddenNeurons) => {
      layerWeights = weights.slice(weightIndex, weightIndex + (prevLayerNeurons * hiddenNeurons));
      this.layers.push(new Layer(hiddenNeurons, prevLayerNeurons, layerWeights));
      weightIndex += prevLayerNeurons * hiddenNeurons;
      prevLayerNeurons = hiddenNeurons;
    });

    // Adding the output layer
    layerWeights = weights.slice(weightIndex, weightIndex + (prevLayerNeurons * outputNeurons));
    this.layers.push(new Layer(outputNeurons, prevLayerNeurons, layerWeights));
  }


  compute(inputValues) {
    if (this.layers.length < 2) {
      return inputValues;
    }

    inputValues.forEach((value, i) => {
      if (this.layers[0].neurons[i]) {
        this.layers[0].neurons[i].value = value;
      }
    });

    let prevLayer = this.layers[0];
    for (let i = 1; i < this.layers.length; i += 1) {
      const layer = this.layers[i];
      for (let j = 0; j < layer.neurons.length; j += 1) {
        const neuron = layer.neurons[j];
        let sum = 0;
        for (let k = 0; k < prevLayer.neurons.length; k += 1) {
          sum += prevLayer.neurons[k].value * neuron.weights[k];
        }
        neuron.value = activation(sum);
      }
      prevLayer = layer;
    }

    const result = [];
    const outputLayer = this.layers[this.layers.length - 1];
    outputLayer.neurons.forEach((neuron) => {
      result.push(neuron.value);
    });

    return result;
  }
}

const fs = require('fs')
const path = require('path')
const resolve = path.resolve
const tf = require('@tensorflow/tfjs-node')
const sentenceModel = require('@tensorflow-models/universal-sentence-encoder')

const CATEGORIES = require('./output/model/categories.json')

function encode(data) {
    return new Promise((res, rej) => {
        sentenceModel.load()
            .then((model) => {
                model.embed(data)
                    .then((embeddings) => res(embeddings))
                    .catch((error) => rej(error))
            })
            .catch((error) => rej(error))
    })
}

function route(tag) {
    const result = new Array(CATEGORIES.length).fill(0)
    const index = CATEGORIES.indexOf(tag)

    if (index !== -1) {
        result[index] = 1
    }

    return result
}

function prepareModel() {
    const model = tf.sequential()

    model.add(tf.layers.dense({
        inputShape: [512],
        activation: 'sigmoid',
        units: CATEGORIES.length
    }))

    model.add(tf.layers.dense({
        inputShape: [2],
        activation: 'sigmoid',
        units: CATEGORIES.length
    }))

    model.add(tf.layers.dense({
        inputShape: [2],
        activation: 'sigmoid',
        units: CATEGORIES.length
    }))

    model.compile({
        loss: tf.losses.softmaxCrossEntropy,
        optimizer: tf.train.adam(.06),
        // metrics: ['AUC']
    })

    return model
}

const items = JSON.parse(fs.readFileSync('./training/sample.json'))

encode(items.map(e => e.text.toLowerCase()))
    .then((data) => {
        const model = prepareModel()

        model.fit(data, tf.tensor2d(items.map(e => route(e.tag))), { epochs: 50 })
            .then((history) => {
                model.save(`file:///${resolve('./')}/output/model`)
                    .then(() => {
                        console.log('Done!')
                    })
                    .catch((error) => console.log(error))
            })
            .catch((error) => console.log(error))
    })
    .catch((error) => console.log(error))

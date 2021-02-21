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

function prepareModel(itemsLength, inputLength, outputLength) {
    const model = tf.sequential()

/*    model.add(tf.layers.conv1d({
        inputShape: [itemsLength, inputLength],
        filters: 50,
        kernelSize: 2,
        padding: 'valid',
        activation: 'relu'
    }))

    model.add(tf.layers.conv1d({
        inputShape: [itemsLength - 1, 50],
        filters: 50,
        kernelSize: 3,
        padding: 'valid',
        activation: 'relu'
    }))

    model.add(tf.layers.conv1d({
        inputShape: [itemsLength  - 3, 50],
        filters: 50,
        kernelSize: 4,
        padding: 'valid',
        activation: 'relu'
    }))

    model.add(tf.layers.globalMaxPool1d({
        inputShape: [itemsLength - 6, 50]
    }))*/

    model.add(tf.layers.dense({
        inputShape: [inputLength],
        activation: 'relu',
        units: outputLength
    }))

    model.add(tf.layers.dropout({
        rate: 0.1
    }))

    model.add(tf.layers.dense({
        inputShape: [outputLength],
        activation: 'softmax',
        units: outputLength
    }))

    model.compile({
        loss: tf.losses.softmaxCrossEntropy,
        optimizer: tf.train.adam(.001),
        metrics: ['accuracy']
    })

    return model
}

const items = JSON.parse(fs.readFileSync('./training/sample.json'))

encode(items.map(e => e.text.toLowerCase()))
    .then((data) => {
        const model = prepareModel(data.shape[0], data.shape[1], CATEGORIES.length)

        model.fit(data, tf.tensor2d(items.map(e => route(e.tag))), { epochs: 500 })
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

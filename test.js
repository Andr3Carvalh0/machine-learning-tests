const fs = require('fs')
const path = require('path')
const resolve = path.resolve
const tf = require('@tensorflow/tfjs-node')
const sentenceModel = require('@tensorflow-models/universal-sentence-encoder')
const toxicity = require('@tensorflow-models/toxicity')

const chunk = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    )

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


function isToxic(text) {
    return new Promise((res, rej) => {
        toxicity.load(0.75)
            .then((model) => {
                model.classify(text)
                    .then((results) => {
                        console.log()
                    })
                    .catch((error) => rej(error))
            })
            .catch((error) => rej(error))
    })
}

const items = JSON.parse(fs.readFileSync('./training/test.json'))

encode(items.map(e => e.text.toLowerCase()))
    .then((data) => {
        isToxic("Fuck you")
            .then(() => {})
            .catch((error) => console.log(error))

        isToxic("Hello")
            .then(() => {})
            .catch((error) => console.log(error))

        tf.loadLayersModel(`file:///${resolve('./')}/output/model/model.json`)
            .then((model) => {
                const tensor = model.predict(data)
                const predictions = chunk(tensor.dataSync(), CATEGORIES.length)

                predictions.map(e => {

                })

                tensor.print()
            })
            .catch((error) => {
                console.log(error)
            })
    })
    .catch((error) => console.log(error))

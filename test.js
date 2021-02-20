const fs = require('fs')
const path = require('path')
const resolve = path.resolve
const tf = require('@tensorflow/tfjs-node')
const sentenceModel = require('@tensorflow-models/universal-sentence-encoder')

const chunk = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    )

const CATEGORIES = [
    'No Issue/Not Clear',
    'Player/Watching',
    'App Performance/Stability',
    'Not Working (General)',
    'AirPlay/Chromecast',
    'Out Of Home',
    'Recordings',
    'Account issues',
    'Suggestions',
    'Other'
]

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

const items = JSON.parse(fs.readFileSync('./training/test.json'))

encode(items.map(e => e.text.toLowerCase()))
    .then((data) => {
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

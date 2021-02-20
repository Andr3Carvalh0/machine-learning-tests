const fs = require('fs')
const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

const CATEGORIES = require('./output/model/categories.json')

function convert(path) {
    return JSON.parse(fs.readFileSync(path))
}

function write(filename, content) {
    fs.writeFileSync(`${filename}`, content)
}

function askInput(items, index, transformed) {
    index = index || 0
    transformed = transformed || []

    if (transformed.length === items.length) {
        rl.close()
        whenDone(transformed)
    } else {
        const e = items[index]

        CATEGORIES.forEach((elem, i) => {
            console.log(`${i+1}) ${elem}`)
        })

        console.log('\n')

        rl.question(`'${e.text.replace('\n', '')}'\n'${e.translated.replace('\n', '')}'\n\nFits in which category?`, (code) => {
            transformed.push({
                text: e.text,
                translated: e.translated,
                tag: CATEGORIES[parseInt(code) - 1]
            })

            askInput(items, index + 1, transformed)
        })
    }
}

function whenDone(transformed) {
    write(`./output/reviews.json`, JSON.stringify(transformed))
}

askInput(
    convert(`./convert/app_store.json`).concat(convert(`./convert/play_store.json`))
)

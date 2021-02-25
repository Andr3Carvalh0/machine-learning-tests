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

function askInput(items, path, index, transformed) {
    index = index || 0
    transformed = transformed || []

    if (transformed.length === 0) {
        console.log(`Classifing ${path}\n`)
    }

    if (transformed.length === items.length) {
        rl.close()
        whenDone(transformed, path)
    } else {
        const e = items[index]

        CATEGORIES.forEach((elem, i) => {
            console.log(`${i+1}) ${elem}`)
        })

        console.log('\n')

        rl.question(`${transformed.length + 1})'${e.text.replace('\n', '')}'\n'${e.translated.replace('\n', '')}'\n\nFits in which category?`, (code) => {
            transformed.push({
                text: e.text,
                translated: e.translated,
                tag: CATEGORIES[parseInt(code) - 1]
            })

            askInput(items, path, index + 1, transformed)
        })
    }
}

function whenDone(transformed, file) {
    write(`./converted/${file}`, JSON.stringify(transformed))
}

let file = undefined

while (file === undefined) {
    const files = fs.readdirSync('./to_convert/').filter(e => e !== '.DS_Store')

    for (let i = 0; i < files.length; i++) {
        if (!fs.existsSync(`./converted/${files[i]}`)) {
            file = files[i]
            break
        }
    }
}

askInput(convert(`./to_convert/${file}`), file)

const express = require('express')
const app = express()
const multer = require('multer')
const upload = multer({dest: 'uploads'})
const plateText = require('./plate')

app.use(express.static('client'))
app.use('/images', express.static('uploads'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

function customLog(msg) {
    console.log('[' + new Date().toISOString() + '] Log: ' + msg)
}

function customError(msg) {
    console.error('[' + new Date().toISOString() + '] Error: ' + msg)
}

app.post('/upload', upload.single('car_image'), (req, res, next) => {
    if (!req.file) {
        customError('Received request without image')
        return res.sendStatus(400)
    }
    customLog('received ' + req.file.originalname)
    plateText(req.file.path, 'json')
    .then(result => {
        customLog('finished processing ' + req.file.originalname)
        plate = JSON.parse(result)[0].plates[0]
        res.send({
            plate: plate,
            image_path: 'images/' + req.file.filename
        })
    })
    .catch(err => {
        res.send(err)
    })
})

app.get('/test', (req, res, next) => {
    plateText('IP-project/car.JPG')
    .then(car_plate => {
        res.send({
            car_plate: car_plate,
            image_path: '<path goes here>'
        })
    })
    .catch(err => {
        res.send(err)
    })
})

app.post('/echo', upload.single('car_image'), (req, res, next) => {
    res.send('<pre>' + JSON.stringify({
        headers: req.headers,
        body: req.body,
        file: req.file,
        files: req.files,
        xhr: req.xhr,
        statusCode: req.statusCode,
        statusMessage: req.statusMessage
    }, null, 4) + '</pre>')
})

app.listen(process.env.PORT, () => {
    console.log('Server listening on port ' + process.env.PORT)
})

const express = require("express")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const os = require("os")

const port = 3000

const app = express()

var fileDir = fs.readdirSync("share")

var adresses = []
const networkInterfaces = os.networkInterfaces()
for (const interfaceName in networkInterfaces) {
    for (const network of networkInterfaces[interfaceName]) {
        if (network.family === 'IPv4' && !network.internal) adresses.push(network.address)
    }
}
const ipv4 = adresses.pop() || "localhost"

const rstr = [
    "\\",
    "/",
    ":",
    "*",
    "?",
    "\"",
    "<",
    ">",
    "|"
]

const DiskStorage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        fileName = file.originalname
        for (let i = 0; i < rstr.length; i++) {
            fileName.replace(rstr[i], "")
        }
        console.log(`Started to transfering file ${fileName}`)
        cb(null, fileName)
    }
})

const upload = multer({
    storage: DiskStorage,
})

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "app/routers"))
app.set("x-powered-by", false)
app.use(express.static("share"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.engine("html", require("ejs").renderFile)

app.get("/", (req, res) => {
    fileDir = fs.readdirSync("share")

    res.locals.files = fileDir

    res.render("index")
})

app.post("/", upload.single("file"), (req, res, next) => {
    const file = req.file

    if (!req.file) return res.end()

    console.log("Transfer finished.")

    res.render("finish")
})

app.listen(port, ipv4, () => {
    console.log(`App started you can access via ${ipv4}:${port}.`)
})
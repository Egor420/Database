const { write } = require("fs")
const http=require(`http`)

const server=http.createServer((req, res)=>{
    console.log(req.url, req.method)

    if (req.url=='/get'){
        res.writeHead(200,{'Content-Type': 'text/plain'})
        res.end('Its get') 
        return
    }
    res.writeHead(200,{'Content-Type': 'text/plain'})
    res.end('Hello world!')
})

server.listen(8080)
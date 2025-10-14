// Import required modules
const http = require( "http" )
const fs = require( "fs" )
const path = require( "path" )

const api = require( "./lib/api" )

// db import
const sqlite3 = require('sqlite3').verbose();
//db initialize
const db = new sqlite3.Database('./mydatabase.sqlite', (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables once DB is opened
db.serialize(() => {

  // Create people table 
  db.run(`CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    notes TEXT NOT NULL,
    schedule TEXT NOT NULL
  )`);

  // Create landlords table
  db.run(`CREATE TABLE IF NOT EXISTS landlords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    landlord TEXT NOT NULL,
    buildings TEXT NOT NULL,
    contact TEXT NOT NULL
  )`);

  // Create buildings table
  db.run(`CREATE TABLE IF NOT EXISTS buildings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building TEXT NOT NULL,
    landlord TEXT NOT NULL,
    rooms INTEGER NOT NULL,
    availability TEXT NOT NULL,
    contact TEXT NOT NULL
  )`);
});

const publicdirectory = path.join( __dirname, "public" )

/**
 * Function to serve static files (HTML, CSS, JS)
 * @param { object } res 
 * @param { string } filepath 
 * @param { string } contenttype 
 */
function servestaticfile( res, filepath, contenttype ) {
  fs.readFile( filepath, ( err, content ) => {
    if( err ) {
      console.error( "404 file not found: ", filepath )
      res.writeHead(404, { "Content-Type": "text/plain" })
      res.end( "404 - Not found" )
    } else {
      res.writeHead( 200, { "Content-Type": contenttype } )
      res.end( content, "utf-8" )
    }
  } )
}

/**
 * Create and start our server
 */
const server = http.createServer( async ( req, res ) => {

  const headers = req.headers;
  // @ts-ignore (tls socket encrypted does exist)
  const protocol = headers[ "x-forwarded-proto" ] || (req.socket.encrypted ? "https" : "http" )
  const host = headers[ "x-forwarded-host"] || headers.host
  const baseurl = `${protocol}://${host}`

  const parsedurl = new URL( req.url, baseurl )
  const pathname = parsedurl.pathname

  let data = ""
  req.on( "data", ( chunk ) => {
    data += chunk
  } )

  let receivedobj
  req.on( "end", async () => {

    try{ 
      receivedobj = JSON.parse( data )
    } catch( e ) { /* silent */ }

    if( 0 == pathname.indexOf( "/api/" ) ) {
      await api.handleapi( parsedurl, res, req, receivedobj, db )
    } else {
      // If the request is for a static file (HTML, CSS, JS)
      let filePath = path.join(
        publicdirectory,
        pathname === "/" ? "/index.html" : pathname
      )
      let extname = path.extname( filePath )
      let contentType = "text/html"

      const types = {
        ".js": "text/javascript",
        ".css": "text/css"
      }
      if( extname in types ) contentType = types[ extname ]

      servestaticfile( res, filePath, contentType )
    }
  } )
})


const port = process.env.PORT || 3000
server.listen( port, () => {
  console.log(`Server is running on port ${port}`)
} )

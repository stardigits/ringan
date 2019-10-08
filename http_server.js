// Modules
const http = require('http');
const cp = require('child_process');
const url = require('url');
const qs = require('querystring');
const fs = require('fs');

// Constants
const hostname = 'localhost';
const port = 8000;
const exec_options = { timeout: 5000, maxBuffer: 1024*1024 };
const http_headers = { 
  text: {
    "Content-type": "text/plain",
    "Access-Control-Allow-Origin" : "*",
    "Access-Control-Allow-Headers": "*",
    "Pragma": "no-cache",
    "Cache-Control": "no-store, no-cache, must-revalidate, post-check=0, pre-check=0",
    "Expires": 0,
    "Last-Modified": new Date(0), // January 1, 1970
    "If-Modified-Since": new Date(0)
  },
  html: {
    "Content-type": "text/html",
    "Access-Control-Allow-Origin" : "*",
    "Access-Control-Allow-Headers": "*",
    "Pragma": "no-cache",
    "Cache-Control": "no-store, no-cache, must-revalidate, post-check=0, pre-check=0",
    "Expires": 0,
    "Last-Modified": new Date(0), // January 1, 1970
    "If-Modified-Since": new Date(0)
  }
};

// Objects


//Variables
var visits = 0;

//Functions
const respond = (res, status, headers, data) => {
  res.writeHead(status || 200, headers);
  res.end(data);
}

const doExec = (res, cmd) => {
  cp.exec(cmd, exec_options, (error, stdout, stderr) => { 
    if (error) {
      console.error(`exec error: ${error}`);
      respond(res, 503, http_headers.text, error.toString());
      return;
    }
    respond(res, 200, http_headers.text, stdout);
  });
}

const doSpawn = (res, cmd, args) => {
  console.log(cmd, args);
  try {
    const child = cp.spawn(cmd, args, { shell: true });
    res.writeHead(200, http_headers.text);
    child.stdout.on( 'data', data => {
      res.write(data);
    });
    child.stderr.on( 'data', data => {
      console.log( `stderr: ${data}` );
      res.end();
    });
    child.on( 'close', code => {
      console.log( `child process exited with code ${code}` );
      res.end();
    });
  } catch(err) {
    console.log(err);
  }
}

const routes = {
  '/': (req, res) => { 
    respond(res, 200, http_headers.html, fs.readFileSync('./index.html').toString());
  },
  //'/': (req, res) => { respond(res, 200, http_headers.text, req.url ); },
  '/hello': (req, res) => { respond(res, 200, http_headers.text, 'Hello World!' ); },
  '/echo': (req, res) => { respond(res, 200, http_headers.text, JSON.stringify(qs.parse(url.parse(req.url).query))); },
  //'/cli': (req, res) => { let q = qs.parse(url.parse(req.url).query); doExec(res, q.cmd); },
  '/cli': (req, res) => { let args = qs.parse(url.parse(req.url).query).cmd.split(/\s+/); let cmd = args.shift(); doSpawn(res, cmd, args); },
  '/uptime': (req, res) => { doSpawn(res, '/usr/bin/uptime'); }
}

const requestHandler = (req, res) => {
  visits++;
  const q = qs.parse(url.parse(req.url).query);
  const pathname = url.parse(req.url).pathname;
  try {
    console.log(`${visits}: ${req.connection.remoteAddress} ${req.method} ${req.url} ${pathname}`, q);
    if (routes[pathname]) { routes[pathname](req,res); }
    else { respond(res, 404, http_headers.text, "Oops, it's not found!"); }
  } catch(err) { console.log(err); }
}

//Main
const server = http.createServer(requestHandler);
server.listen(port, hostname, () => {
  var a = 3, b = 3.1415;
  console.log(`PI is nearly ${Math.max(a, b)}`);
  console.log(`Server running at http://${hostname}:${port}/`);
});


http = require('http');
util = require('util');

httpServer = 'http://127.0.0.1:8000';
url = process.argv[2];
if (process.argv[2]) { url = process.argv[2]; } else { url = httpServer; }

http
.get(url, (res) => {
  const { statusCode } = res;
  const contentType = res.headers['content-type'];
  let error;
  if (statusCode !== 200) {
    error = new Error('Request Failed.\n' +
                      `Status Code: ${statusCode}`);
/*
  } else if (!/^application\/json/.test(contentType)) {
    error = new Error('Invalid content-type.\n' +
                      `Expected application/json but received ${contentType}`);
*/
	}
  if (error) {
    console.error(error.message);
    // consume response data to free up memory
    res.resume();
    return;
  }

  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      //const parsedData = JSON.parse(rawData);
			//console.log(util.inspect(res));
			console.log(res.statusCode);
			console.log(util.inspect(res.headers)+'\r\n');
      console.log(rawData);
    } catch (e) {
      console.error(e.message);
    }
  });
})
.on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});


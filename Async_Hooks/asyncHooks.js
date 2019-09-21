// https://nodejs.org/dist/latest-v12.x/docs/api/async_hooks.html
const async_hooks = require('async_hooks');
const https = require('https');
const fs = require('fs');
const util = require('util');
const { HttpAsyncResourceClass } = require('./HttpAsyncResourceClass');

var options = {
  host: 'jsonplaceholder.typicode.com',
  port: 443,
  path: '/todos/1',
  method: 'GET'
};

const makeRequest = (options, payload) => {
  return new Promise((resolve, reject) => {
    var req = https.request(options, function (res) {

      res.setEncoding('utf8');
      const data = [];
      res.on('data', function (chunk) {
        data.push(chunk);
      });

      res.on('end', () => {
        resolve({
          body: data.join(''),
          statusCode: res.statusCode,
          headers: res.headers
        })
      })
    });

    req.on('error', function (e) {
      reject(e);
    });

    // write data to request body
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

const promiseResolve = (asyncId) => {
  console.log('asyncId = ', asyncId);
}

// Use fs sync methods to prevent infinite loop as console.log is async
const initOutFile = 'Async_Hooks/output.txt';
fs.writeFileSync(initOutFile, '');
const init = (asyncId, type, triggerAsyncId, resource) => {
  const eid = async_hooks.executionAsyncId();
  fs.appendFileSync(initOutFile, 'eid = ' + eid + '\n');
  fs.appendFileSync(initOutFile, 'asyncId = ' + asyncId + '\n');
  fs.appendFileSync(initOutFile, 'type = ' + type + '\n');
  fs.appendFileSync(initOutFile, 'triggerAsyncId = ' + triggerAsyncId + '\n');
  fs.appendFileSync(initOutFile, 'resource = ' + util.inspect(resource) + '\n');
  fs.appendFileSync(initOutFile, '------------------------------\n');
}

// Create hook and enable it
const asyncHook = async_hooks.createHook({ init, promiseResolve });
asyncHook.enable();

// Start collecting events
makeRequest(options)
  .then((data) => {
    console.log(JSON.stringify(JSON.parse(data.body), null, 2));
  })
  .catch((err) => {
    console.error(JSON.stringify(err, null, 2));
  });

// Start collecting events using extenced AsyncResource class
new HttpAsyncResourceClass(options, null)
  .makeRequest((err, data) => {
    console.log('err = ' + util.inspect(err));
    console.log('data = ' + util.inspect(data));
  });


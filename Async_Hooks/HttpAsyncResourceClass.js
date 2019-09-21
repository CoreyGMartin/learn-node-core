const https = require('https');
const { AsyncResource } = require('async_hooks');

class HttpAsyncResourceClass extends AsyncResource {
  constructor(httpOptions, payload) {
    super('HttpAsyncResourceClass');
    this.httpOptions = httpOptions;
    this.payload = payload;
  }

  makeRequest(callback) {
    const self = this;
    const req = https.request(this.httpOptions, function (res) {

      res.setEncoding('utf8');
      const data = [];
      res.on('data', function (chunk) {
        data.push(chunk);
      });

      res.on('end', () => {
        self.runInAsyncScope(callback, null, null, {
          body: data.join(''),
          statusCode: res.statusCode,
          headers: res.headers
        });
        self.emitDestroy();
      })
    });

    req.on('error', function (e) {
      self.runInAsyncScope(callback, null, e);
      self.emitDestroy();
    });

    // write data to request body
    if (self.payload) {
      req.write(self.payload);
    }
    req.end();
  }

}

module.exports = {
  HttpAsyncResourceClass
}
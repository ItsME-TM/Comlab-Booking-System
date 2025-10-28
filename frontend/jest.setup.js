// Polyfill TextEncoder and TextDecoder for Node.js environment
// This MUST run before any imports that use MSW
const { TextEncoder, TextDecoder } = require('util');

if (typeof global !== 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}


require('@babel/register')({
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
})

const server = require('./server')

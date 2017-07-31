module.exports = {
  plugins: [
    require('postcss-var-map')({
        file: 'example/css-var-map.js',
        prefix: 'onCssVarMap(',
        suffix: ');',
        remove: true
    })
  ]
}

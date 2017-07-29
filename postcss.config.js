module.exports = {
  plugins: [
    require('postcss-var-map')({
        file: 'css-var-map.js',
        prefix: 'onCssVarMap(',
        suffix: ');'
    })
  ]
}

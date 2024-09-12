module.exports = {
    // Other webpack config settings like entry, output, etc.
    module: {
      rules: [
        {
          test: /\.node$/,
          use: 'node-loader',
        },
        // Other rules
      ],
    },
    // Other configurations like plugins, resolve, etc.
  };
  
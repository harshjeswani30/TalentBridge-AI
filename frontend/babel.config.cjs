console.log('--- BABEL CONFIG LOADED ---');

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    'babel-plugin-transform-import-meta',
    function({ types: t }) {
      return {
        visitor: {
          MetaProperty(path) {
            if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
              path.replaceWith(
                t.objectExpression([
                  t.objectProperty(
                    t.identifier('env'),
                    t.objectExpression([
                      t.objectProperty(
                        t.identifier('VITE_API_URL'),
                        t.stringLiteral(process.env.VITE_API_URL || 'http://localhost:5000/api')
                      )
                    ])
                  )
                ])
              );
            }
          }
        }
      };
    }
  ],
};

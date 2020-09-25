const packageJson = require('../../package.json'); // Take root package.json
const fs = require('fs');
const deps = packageJson['deviceDependencies'];

// Template of package.json for device
const devicePackageJson = {
  engines: { node: '10' },
  main: 'main.js',

  // filter only dependencies we need for device
  dependencies: deps.reduce((acc, cur) => {
    acc[cur] = packageJson.dependencies[cur];
    return acc;
  }, {})
};

const writePath = 'dist/apps/device'; 

fs.writeFileSync(`${writePath}/package.json`, JSON.stringify(devicePackageJson));

fs.copyFileSync('apps/device/Dockerfile.template', `${writePath}/Dockerfile.template`);

console.log(`package.json and Dockerfile written to ${writePath} successfully.`);

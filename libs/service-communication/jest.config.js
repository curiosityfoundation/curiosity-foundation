module.exports = {
  name: 'service-communication',
  // from effect-ts 
  testEnvironment: "node",
  clearMocks: true,

  preset: '../../jest.config.js',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/service-communication',
};
// module.exports = {
//   preset: "ts-jest",
//   testEnvironment: "node",
//   rootDir: "./",
//   clearMocks: true,
//   collectCoverage: false,
//   coverageDirectory: "coverage",
//   collectCoverageFrom: ["packages/**/src/**/*.ts"],
//   setupFiles: ["./scripts/jest-setup.ts"],
//   modulePathIgnorePatterns: ["<rootDir>/packages/.*/build", "<rootDir>/_tmp"],
//   verbose: false,
//   moduleNameMapper: {
//     "@effect-ts/morphic/(.*)$": "<rootDir>/packages/morphic/build/$1",
//     "@effect-ts/morphic$": "<rootDir>/packages/morphic/build",
//     "@effect-ts/monocle/(.*)$": "<rootDir>/packages/monocle/build/$1",
//     "@effect-ts/monocle$": "<rootDir>/packages/monocle/build",
//     "@effect-ts/system/(.*)$": "<rootDir>/packages/system/build/$1",
//     "@effect-ts/system$": "<rootDir>/packages/system/build",
//     "@effect-ts/core/(.*)$": "<rootDir>/packages/core/build/$1",
//     "@effect-ts/core$": "<rootDir>/packages/core/build"
//   }
// }
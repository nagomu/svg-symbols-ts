import { execSync } from 'child_process';
import fs from 'fs';
import path = require('path');

describe('svgSymbols', () => {
  const file = path.resolve(__dirname, '../', '../', 'svg-symbols.js');

  it('generates svg-sprite correctly', () => {
    const argv =
      '--src=src/__tests__/fixtures --out=src/__tests__/fixtures/output.svg';
    try {
      execSync(`node ${path.resolve(file)} ${argv}`);

      const expectedFile = path.resolve(
        __dirname,
        '__tests__',
        'fixtures',
        'expected.svg',
      );
      const outputFile = path.resolve(
        __dirname,
        '__tests__',
        'fixtures',
        'output.svg',
      );
      const expected = fs.readFileSync(expectedFile);
      const output = fs.readFileSync(outputFile);
      expect(expected.toString()).toEqual(output.toString());
    } catch {
      /**/
    }
  });

  it('returns an error if there is no process.argv', () => {
    const expected =
      'Invalid Argument: `src` is required 🙏\nInvalid Argument: `out` is required 🙏';
    try {
      const result = execSync(`node ${path.resolve(file)}`);
      expect(result.toString()).toEqual(expected);
    } catch {
      /**/
    }
  });

  it('returns an error if there is no --src option', () => {
    const expected = 'Invalid Argument: `src` is required 🙏';
    try {
      const result = execSync(
        `node ${path.resolve(file)} --out=svg-sprite.svg`,
      );
      expect(result.toString()).toEqual(expected);
    } catch {
      /**/
    }
  });

  it('returns an error if there is no --out option', () => {
    const expected = 'Invalid Argument: `out` is required 🙏';
    try {
      const result = execSync(`node ${path.resolve(file)} --src=fixture`);
      expect(result.toString()).toEqual(expected);
    } catch {
      /**/
    }
  });
});

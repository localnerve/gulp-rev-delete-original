/**
 * Test gulp-rev-delete-original
 * 
 * Copyright (c) 2025 Alex Grant <info@localnerve.com> (https://www.localnerve.com), LocalNerve LLC
 * Licensed under the MIT license.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import File from 'vinyl';
import revDel from '../index.js';

describe('gulp-rev-delete-original', () => {

  it('should not remove the original file when it has not been rewritten', () => {
    const file = new File({
      cwd: '/',
      base: '/test/',
      path: '/dist/index.js',
      contents: Buffer('')
    });

    file.revOrigPath = '/dist/index.js';

    return new Promise((resolve, reject) => {
      const stream = revDel({ remove: async path => reject() });

      stream.on('data', () => {
        resolve();
      });

      stream.write(file);
    });
  });

  it('should remove the original original file when it has been rewritten', () => {
    let removeWasCalled = false;

    const file = new File({
      cwd: '/',
      base: '/test/',
      path: '/dist/index.abcd.js',
      contents: Buffer('')
    });

    file.revOrigPath = '/dist/index.js';

    return new Promise(resolve => {
      const stream = revDel({remove: async path => {
        removeWasCalled = true;
        // Make sure we're removing the ORIGINAL file
        assert.strictEqual(path, file.revOrigPath);
      }});

      stream.on('data', () => {
        // Make sure we removed a file
        assert(removeWasCalled);
        resolve();
      });

      stream.write(file);
    });
  });

  it('should remove the original file when it has been rewritten and has not been excluded', () => {
    let removeWasCalled = false;

    const file = new File({
      cwd: '/',
      base: '/test/',
      path: '/dist/index.abcd.js',
      contents: Buffer('')
    });

    file.revOrigPath = '/dist/index.js';

    return new Promise(resolve => {
      const stream = revDel({
        exclude: () => false,
        remove: async path => {
          removeWasCalled = true;
          // Make sure we're removing the ORIGINAL file
          assert.strictEqual(path, file.revOrigPath);
        }
      });

      stream.on('data', () => {
        // Make sure we removed a file
        assert(removeWasCalled);
        resolve();
      });

      stream.write(file);
    });
  });

  it('should not remove the original file when it has been rewritten and has been excluded', () => {
    let removeWasCalled = false;

    const file = new File({
      cwd: '/',
      base: '/test/',
      path: '/dist/index.abcd.js',
      contents: Buffer('')
    });

    file.revOrigPath = '/dist/index.js';

    return new Promise(resolve => {
      const stream = revDel({
        exclude: () => true,
        remove: async path => {
          removeWasCalled = true;
          // Make sure we're removing the ORIGINAL file
          assert.strictEqual(path, file.revOrigPath);
        }
      });

      stream.on('data', () => {
        // Make sure removed not called
        assert(!removeWasCalled);
        resolve();
      });

      stream.write(file);
    });
  });

  it('should not remove the original file when it has been rewritten and has been excluded, regex', () => {
    let removeWasCalled = false;

    const file = new File({
      cwd: '/',
      base: '/test/',
      path: '/dist/index.abcd.js',
      contents: Buffer('')
    });

    file.revOrigPath = '/dist/index.js';

    return new Promise(resolve => {
      const stream = revDel({
        exclude: /\/dist\/index\.abcd\.js$/,
        remove: async path => {
          removeWasCalled = true;
          // Make sure we're removing the ORIGINAL file
          assert.strictEqual(path, file.revOrigPath);
        }
      });

      stream.on('data', () => {
        // Make sure removed not called
        assert(!removeWasCalled);
        resolve();
      });

      stream.write(file);
    });
  });

  it('should handle remove error as stream error', () => {
    const msg = 'Houston, we have a problem';
    const file = new File({
      cwd: '/',
      base: '/test/',
      path: '/dist/index.abcd.js',
      contents: Buffer('')
    });

    file.revOrigPath = '/dist/index.js';

    return new Promise(resolve => {
      const stream = revDel({
        remove: async path => {
          throw new Error(msg);
        }
      });

      stream.on('error', error => {
        assert.strictEqual(error.message, msg);
        resolve();
      });

      stream.write(file);
    });
  });

  it('should run default rimraf without fail', () => {
    const file = new File({
      cwd: '/',
      base: '/test/',
      path: '/dist/index.abcd.js',
      contents: Buffer('')
    });

    file.revOrigPath = '/dist/index.js';

    return new Promise((resolve, reject) => {
      const stream = revDel();

      stream.on('finish', () => {
        // only way to verify is in coverage or debugger
        // (this should keep coverage at 100%)
        resolve();
      });

      stream.on('error', () => {
        reject();
      });

      stream.write(file);
      stream.end();
    });
  });

  it('should passthru non revved files', () => {
    let excludeCalled = false;
    const path = '/dist/index.abcd.js';

    const file = new File({
      cwd: '/',
      base: '/test/',
      path,
      contents: Buffer('')
    });

    return new Promise(resolve => {
      const stream = revDel({
        exclude: () => !(excludeCalled = true)
      });

      stream.on('data', file => {
        // Make sure exclude not called and its just the file
        assert(!excludeCalled);
        assert.strictEqual(file.path, path);
        resolve();
      });

      stream.write(file);
    });
  });
});
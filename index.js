/**
 * gulp-rev-delete-original
 * 
 * Copyright (c) 2025 Alex Grant <info@localnerve.com> (https://www.localnerve.com), LocalNerve LLC
 * Licensed under the MIT license.
 */
import { Transform } from 'node:stream';
import fs from 'node:fs/promises';

/**
 * Remove a path.
 * 
 * @param {String} path - The file or directory to remove
 * @returns {Promise} resolves on success, reject on failure
 */
function rimraf (path) {
  return fs.rm(path, { recursive: true, force: true });
}

/**
 * Return a stream for deleting the original file.
 *
 * @param {object} [options] - The plugin options
 * @param {RegExp|function} [options.exclude] - Function or regex to determine file exclusion
 * @param {AsyncFunction} [options.remove] - Async Function to remove the file
 * @return {Stream} Transform stream
 */
export default function deleteOriginal ({
  exclude = null,
  remove = rimraf
} = {}) {
  return new Transform({
    objectMode: true,
    transform: async (file, encoding, cb) => {
      // Passthru non rev
      if (!file.revOrigPath) {
        return cb(null, file);
      }

      // Don't delete files that haven't been rewritten
      if (file.revOrigPath === file.path) {
        return cb(null, file);
      }

      // Perform any exclusion
      if (exclude) {
        let excluded = false;

        if (typeof exclude === 'function') {
          excluded = exclude(file);
        } else if (exclude instanceof RegExp) {
          excluded = exclude.test(file.path);
        }

        if (excluded) {
          return cb(null, file);
        }
      }
      
      // Remove the original file
      try {
        await remove(file.revOrigPath);
        cb(null, file);
      } catch (e) {
        cb(e);
      }
    }
  });
};

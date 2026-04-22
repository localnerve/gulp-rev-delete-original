# gulp-rev-delete-original

> A fork of the original [nib-health-funds/gulp-rev-delete-original](https://github.com/nib-health-funds/gulp-rev-delete-original) with updated dependencies, code, and support

Delete the original file rewritten by
[gulp-rev](https://www.npmjs.com/package/gulp-rev) or
[gulp-rev-all](https://www.npmjs.com/package/gulp-rev-all).

## Installation

    npm install --save-dev gulp-rev-delete-original

## Usage

```js
import gulp from 'gulp';
import rev from 'gulp-rev';
import revdel from 'gulp-rev-delete-original';

gulp.task('rev', function () {
  return gulp.src('./source/**/*')
    .pipe(rev())
    .pipe(revdel())
    .pipe(gulp.dest('./destination/'))
  ;
});
```

## Options

#### exclude

A filter `RegExp` or `function` that allows you to exclude certain files from being deleted.

##### Example

RegExp:

```js
revdel({
  exclude: /build\.css$/
});
```

Function:

```js
revdel({
  exclude: file => {
    if (/build\.css$/.test(file.name)) {
      return true; // if you want to exclude the file from being deleted
    }
  }
});
```
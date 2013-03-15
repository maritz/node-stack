/*global describe it */
'use strict';
var assert = window.assert;
(function () {
    describe('Give it some context', function () {
        describe('maybe a bit more context here', function () {
            it('should run here few assertions', function () {
              assert.equal(document.title, true);
            });
            it('should fail', function () {
              assert.equal(true, false);
            });
        });
    });
})();

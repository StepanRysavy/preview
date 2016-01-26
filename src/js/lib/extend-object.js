function extend (target, source) {
    var a = Object.create(target);
    Object.keys(source).map(function (prop) {
        prop in a && (a[prop] = source[prop]);
    });
    return a;
};

Object.prototype.extend = function (source) {
	return extend(this, source);
}
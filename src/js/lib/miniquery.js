var $ = function (query, element) {

	element = element || document;

	if (element.querySelectorAll(query).length > 1) {
		return element.querySelectorAll(query);
	} else {
		return element.querySelector(query);
	}
};
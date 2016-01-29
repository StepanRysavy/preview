;(function () {

    var self = this, links = [];

    function renderLink (link) {

        function create(item, type, to, className, innerHTML) {
            element[item] = document.createElement(type);
            element[item].className = className || '';
            element[item].innerHTML = innerHTML || '';
            element[to].appendChild(element[item]);
        }

        function createFormItem (name, type, to) {
            create("input_" + name + "_label", "label", to, "label", name);
            create("input_" + name + "_ui", type, to, "input-" + type);
        }

        var element = {};

        element.holder = $(".dropdata-elements");

        create("group", "div", "holder", "group");
        create("layout", "div", "group", "group-layout");
        create("preview", "div", "layout", "group-preview");
        create("data", "div", "layout", "group-data");
        create("title", "div", "data");
        create("description", "div", "data");
        create("width", "div", "data");
        create("height", "div", "data");
        create("enabled", "div", "data");

        if (link.type === "img") {
            element.item = document.createElement("IMG");
            element.item.width = link.width;
            element.item.height = link.height;
            element.item.src = "//" + link.src;
        } else if (link.type = "iframe") {
            element.item = document.createElement("IFRAME");
            element.item.src = "//" + link.src;
        }

        element.preview.appendChild(element.item);

        createFormItem("title", "input", "title");
        createFormItem("description", "textarea", "description");

        if (link.width === 0) {
            
            function setWidth () {
                link.width = Number(element.input_width_ui.value);
                element.item.width = link.width;
            }

            function setHeight () {
                link.height = Number(element.input_height_ui.value);
                element.item.height = link.height;
            }

            createFormItem("width", "input", "width");
            createFormItem("height", "input", "height");
            element.input_width_ui.value = 300;
            element.input_width_ui.type = "number";
            element.input_width_ui.addEventListener("change", setWidth);

            element.input_height_ui.value = 250;
            element.input_height_ui.type = "number";
            element.input_height_ui.addEventListener("change", setHeight);

            setWidth();
            setHeight();
        }

        createFormItem("enabled", "select", "enabled");

        create("enabled_true", "option", "input_enabled_ui", "", "yes");
        create("enabled_false", "option", "input_enabled_ui", "", "no");

        function setEnabled() {
            var selected = element.input_enabled_ui.selectedOptions;

            if (selected.innerHTML === "yes") {
                link.enabled = true;
            } else {
                link.enabled = false;
            }
        }

        element.input_enabled_ui.addEventListener("change", setEnabled);

        return element;

    }

    function createLink (data) {

        data = JSON.parse(data);

        var link = {
            base: data.dir,
            name: data.link,
            src: data.fullpath,
            width: data.width || 0,
            height: data.height || 0,
            type: data.type,
            id: data.id,
            description: '',
            enabled: true
        };

        links.push(link);

        return link;
    }

    function addLink (data) {
        var link = createLink (data);
        link.element = renderLink (link);
    }

    window.Preview = {
        data: links,
        addLink: addLink
    }
})();
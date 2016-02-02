;(function () {

    var self = this, 
        links = [], 
        base = "//preview.omicrone.net/", 
        fetch_project = undefined,
        hash = window.location.hash.substr(2);

    var view_intro = $(".app-intro"),
        view_upload = $(".app-upload"),
        view_view = $(".app-view");

    var element_intro_id = $("#intro-input-id"),
        element_intro_pass = $("#intro-input-pass"),
        element_intro_btn = $("#intro-btn");

    var element_view_dialog = $(".view-confirm-pass"),
        element_view_pass = $("#view-input-pass"),
        element_view_btn = $("#view-btn");

    var element_upload_btn = $("#upload-btn"),
        element_upload_client = $("#upload-input-client"),
        element_upload_project = $("#upload-input-project"),
        element_upload_type = $("#upload-input-type"),
        element_upload_password = $("#upload-input-password");

    // hash

    function f_time(time) {
        return new Date(time);
    }

    function f_hash() {
        hash = window.location.hash.substr(2);

        $(".view").innerHTML = '';

        if (hash === "" || hash === "new") {
            f_restore ();
        } else {
            view_intro.classList.add("hide");
            view_upload.classList.add("hide");
            view_view.classList.remove("hide");
            fetch_project = hash;
            _fetchLink(fetch_project, element_intro_pass.value);
        }
    }

    if (hash != '') {
        f_hash();
    } else {
        view_intro.classList.remove("hide");
    }

    window.addEventListener("hashchange", f_hash);

    // restore 

    function f_restore () {
        view_intro.classList.remove("hide");
        view_upload.classList.add("hide");
        view_view.classList.add("hide");
    }

    // form get

    function f_intro_click() {
        fetch_project = element_intro_id.value;

        _fetchLink(fetch_project, element_intro_pass.value);
    }

    element_intro_btn.addEventListener("click", f_intro_click);

    // form password

    function f_view_click() {

        _fetchLink(fetch_project, element_view_pass.value);
    }

    element_view_btn.addEventListener("click", f_view_click);

    // form create

    function f_upload () {

        links.forEach(function (link) {
            link.element = undefined;
        });

        var uploadType = (element_upload_type.selectedOptions[0].value != "null") ? element_upload_type.selectedOptions[0].text : undefined;

        var data = {
            links: links,
            client: element_upload_client.value,
            project: element_upload_project.value,
            time: Date.now(),
            type: uploadType
        };

        _saveLink (
            JSON.stringify(data), 
            element_upload_client.value, 
            element_upload_project.value, 
            uploadType,
            element_upload_password.value
        );
    }

    element_upload_btn.addEventListener("click", f_upload);

    // save link

    function _saveLink (data, client, project, type, password) {

        var param = "data=" + data + "&pass=" + password + "&client=" + client + "&project=" + project + "&type=" + type;

        _ajax(param, "save", _saveLink_complete);
    }

    function _saveLink_complete (data) {
        var response = JSON.parse(data);

        if (response.code === 200) {
            view_upload.classList.add("hide");

            window.location.hash = "#/" + response.id;
        }

        console.log(response);
    }

    // fetch link

    function _fetchLink (link, pass) {

        var param = "id=" + link + "&pass=" + pass;

        window.removeEventListener("hashchange", f_hash);

        window.location.hash = "#/" + link;

        window.addEventListener("hashchange", f_hash);

        _ajax(param, "get", _fetchLink_complete);

    }

    function _fetchLink_complete (data) {
        var response = JSON.parse(data);

        view_intro.classList.add("hide");
        view_view.classList.remove("hide");

        if (response.code === 300) {
            element_view_dialog.classList.remove("hide");
        } else {
            element_view_dialog.classList.add("hide");
        }

        if (response.code === 200) {
            var data = JSON.parse(response.data);

            _renderLinkFetch(data, response.id)
        }

        if (response.code === 400) {
            $(".view").innerHTML = '<div class="view-message"><h2>Project cannot be displayed</h2><p>' + response.message + '</p><p><a href="/" class="btn">Show homepage</a></p></div>';
        }
    }

    function _renderLinkFetch (data, id) {

        var view = $(".view");
        view.innerHTML = '';

        function create(type, className, to, innerHTML) {
            var element = document.createElement(type);
            element.className = className || '';
            element.innerHTML = innerHTML || '';
            to.appendChild(element);

            return element;
        }

        var headlineContent = [];

        if (data.client) headlineContent.push(data.client);
        if (data.project) headlineContent.push(data.project);
        if (data.type) headlineContent.push(data.type);

        var header = create("div", "header", view);

        var headline = create("h1", "headline", header, headlineContent.join(" — "));
        var time = create("p", "headline-time", header, f_time(data.time));
        var permalink = create("a", "headline-permalink", header, "http:" + base + "view/" + id);
            permalink.href = "http:" + base + "view/" + id;

        var content = create("div", "content", view);

        data.links.forEach(function (link) {

            if (link.enabled === true) {

                var group = create("div", "group", content);
                var layout = create("div", "group-layout", group);
                var preview = create("div", "group-preview", layout);
                var data = create("div", "group-data", layout);  

                var previewElement = create(link.type, "group-preview-" + link.type, preview);
                previewElement.width = link.width;
                previewElement.height = link.height;
                previewElement.src = "//" + link.src;

                if (link.title || link.type === "iframe") {

                    var titleHolder = create("h4", "group-title-holder", data);
                    
                    if (link.title) if (link.title.length > 0) var title = create("span", "group-title", titleHolder, link.title);
                    if (link.type === "iframe") {

                        function reload_iFrame () {
                            previewElement.src = "//" + link.src;
                        }

                        var reload = create("a", "group-title-reload", titleHolder, "replay");
                        reload.addEventListener("click", reload_iFrame);
                    }

                }
                if (link.description) if (link.description.length > 0) var description = create("p", "group-description", data, link.description);

            }

        });

    }

    // create link

    function _renderLink (link) {

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
        create("title", "div", "data", "group");
        create("description", "div", "data", "group");

        if (link.type === "img") {

            element.item = document.createElement("IMG");
            element.item.width = link.width;
            element.item.height = link.height;
            element.item.src = "//" + link.src;
        } else if (link.type = "iframe") {
            element.item = document.createElement("IFRAME");
            element.item.src = "//" + link.src;

            create("width", "div", "data", "group");
            create("height", "div", "data", "group");
        }

        create("enabled", "div", "data", "group");

        element.preview.appendChild(element.item);

        createFormItem("title", "input", "title");
        createFormItem("description", "textarea", "description");

        function updateTitle () {
            link.title = element.input_title_ui.value;
        }

        function updateDescription () {
            link.description = element.input_description_ui.value;
        }

        element.input_title_ui.addEventListener("change", updateTitle);
        element.input_description_ui.addEventListener("change", updateDescription);

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

    function _createLink (data) {

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

    function _addLink (data) {
        var link = _createLink (data);
        link.element = _renderLink (link);

        view_intro.classList.add("hide");
        view_upload.classList.remove("hide");
    }
    
    function _ajax (param, fce, callback) {
        http = new XMLHttpRequest();
        http.onreadystatechange = function () {
            if(http.readyState == 4 && http.status == 200) {
                if (callback !== undefined) {
                    callback(http.responseText);
                } else {
                    console.log(http.responseText);
                }
            }
        }
        
        //Send the proper header information along with the request
        http.open("POST", base + fce + ".php", true);
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        http.send(param);
    }

    window.Preview = {
        data: links,
        addLink: _addLink
    }

    $(".container").classList.remove("hide"); 
})();
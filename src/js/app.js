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

    var svg = {
        repeat: "M1536 1280v-448q0 -26 -19 -45t-45 -19h-448q-42 0 -59 40q-17 39 14 69l138 138q-148 137 -349 137q-104 0 -198.5 -40.5t-163.5 -109.5t-109.5 -163.5t-40.5 -198.5t40.5 -198.5t109.5 -163.5t163.5 -109.5t198.5 -40.5q119 0 225 52t179 147q7 10 23 12q14 0 25 -9 l137 -138q9 -8 9.5 -20.5t-7.5 -22.5q-109 -132 -264 -204.5t-327 -72.5q-156 0 -298 61t-245 164t-164 245t-61 298t61 298t164 245t245 164t298 61q147 0 284.5 -55.5t244.5 -156.5l130 129q29 31 70 14q39 -17 39 -59z",
        download: "M1280 192q0 26 -19 45t-45 19t-45 -19t-19 -45t19 -45t45 -19t45 19t19 45zM1536 192q0 26 -19 45t-45 19t-45 -19t-19 -45t19 -45t45 -19t45 19t19 45zM1664 416v-320q0 -40 -28 -68t-68 -28h-1472q-40 0 -68 28t-28 68v320q0 40 28 68t68 28h465l135 -136 q58 -56 136 -56t136 56l136 136h464q40 0 68 -28t28 -68zM1339 985q17 -41 -14 -70l-448 -448q-18 -19 -45 -19t-45 19l-448 448q-31 29 -14 70q17 39 59 39h256v448q0 26 19 45t45 19h256q26 0 45 -19t19 -45v-448h256q42 0 59 -39z"
    };

    var downloadLinkPlaceholder;

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

        function downloadAllFiles(e) {
            e.preventDefault();
            _downloadLink(data.links);
        }

        var downloadAll = create("a", "headline-download icon", header, '<svg viewbox="0 0 1664 1664"><path d="' + svg.download + '" /></svg>');
            downloadAll.addEventListener("click", downloadAllFiles);

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

                        var reload = create("a", "group-title-reload icon", titleHolder, '<svg viewbox="0 0 1792 1536"><path d="' + svg.repeat + '" /></svg>');
                        reload.addEventListener("click", reload_iFrame);
                    }

                    function downloadFile(e) {
                        e.preventDefault();
                        window.open(download.href, "_blank");
                    }

                    var download = create("a", "group-title-download icon", titleHolder, '<svg viewbox="0 0 1664 1664"><path d="' + svg.download + '" /></svg>');
                    download.href = "//" + link.src + (link.type === "iframe" ? ".zip" : "");

                    if (typeof download.download != "undefined") {
                        download.download = link.originalName || "download";
                    } else {
                        download.addEventListener("click", downloadFile);
                    }

                }
                if (link.description) if (link.description.length > 0) var description = create("p", "group-description", data, link.description);

            }

        });

    }

    // download all links

    function _downloadLink_complete (data) {
        console.log("Download ready");
        var response = JSON.parse(data);

        if (response.code === 200) {
            window.location.replace(response.archive);
        }
        
    }

    function _downloadLink (links) {
        var linksToZip = [];

        links.forEach(function (link) {
            linksToZip.push(link.name + (link.type === "iframe" ? ".zip" : ""));
        });

        var param = "files=" + linksToZip.join(",");

        _ajax(param, "download", _downloadLink_complete);
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

        function fetchFileDimensionData () {

            if (loadedIFrame === true) return;
            loadedIFrame = true;

            // check for <meta name="ad.size" content="width=300,height=250">

            var content,
                meta,
                firstDIV,
                metaFound = false,
                interval;

            console.log("Fetch begin");

            function loaded () {

                console.log("Fetch loaded");

                meta = content.querySelectorAll("meta");

                meta.forEach(function (metaElement) {
                    if (metaElement.getAttribute("name") === "ad.size") {
                        var data = metaElement.getAttribute("content").split(",");

                        data.forEach(function (dataItem) {
                            var value = dataItem.split("=");

                            if (value.length > 1) {
                                value[1] = Number(value[1]);

                                if (value[0].toLowerCase() === "width") {
                                    element.input_width_ui.value = value[1];
                                    setWidth();
                                }

                                if (value[0].toLowerCase() === "height") {
                                    element.input_height_ui.value = value[1];
                                    setHeight();
                                }


                            }
                        });

                        element.input_title_ui.value = element.input_width_ui.value + "x" + element.input_height_ui.value;
                        updateTitle ();

                        metaFound = true;

                        console.log("Fetch by meta");
                    }
                });

                if (metaFound === false) {
                    // setTimeout(function () {
                        firstDIV = content.querySelector("body>div");

                        element.input_width_ui.value = firstDIV.offsetWidth;
                        element.input_height_ui.value = firstDIV.offsetHeight;
                        element.input_title_ui.value = element.input_width_ui.value + "x" + element.input_height_ui.value;

                        setWidth();
                        setHeight();
                        updateTitle ();

                        console.log("Fetch by first element");

                    // }, 200);
                    
                }
            }

            function loader () {
                content = element.item.contentDocument || element.item.contentWindow.document;

                console.log ("Fetch check loaded", content.readyState, content);

                if (  content.readyState  == 'complete' ) {
                    clearInterval(interval);
                    loaded ();
                }
            }

            interval = setInterval(loader, 100);

        }

        var element = {},
            loadedIFrame = false;

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
        } else if (link.type = "iframe") {
            element.item = document.createElement("IFRAME");
            element.item.addEventListener("load", fetchFileDimensionData);

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

        /**

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
            
        element.item.src = "//" + link.src;

        */
        
        element.item.src = "//" + link.src;

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
            originalName: data.name,
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
layui.define(function(exports){
    var $ = layui.jquery;
    var $target,
        pageAjaxUrl,
        type = 1;       // 1: 内容与分页分离 2：内容与分页整体

    // function getAjaxUrl(param) {
    //     var result = [];
    //     for(var key in param) {
    //         result.push(key + '=' + param[key]);
    //     }
    //     return pageAjaxUrl + '?' + result.join('&');
    // }

    function getAjaxUrl(param) {
        var result = [];
        for(var key in param) {
            result.push(key + '=' + encodeURIComponent(param[key]));
        }
        if(pageAjaxUrl.indexOf('?') != -1) {
            return pageAjaxUrl + '&' + result.join('&');
        } else {
            return pageAjaxUrl + '?' + result.join('&');
        }
    }

    /**
     * 内容与分页分离
     * 内容与分页是整体
     * @param param
     */
    function renderPager(param, renderForm) {
        var ajaxUrl = '';
        if(Object.prototype.toString.call(param) == '[object Object]') {
            ajaxUrl = getAjaxUrl(param)
        } else {
            ajaxUrl = param;
        }
        if(type == '1') {
            $.ajax({
                url: ajaxUrl,
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    if(res.status) {
                        $('.ajaxTableTbody').html(res.data.listContent);
                        $('.ajaxTablePage').html(res.data.pageHtml);
                        if(renderForm && Object.prototype.toString.call(renderForm) == '[object Function]') {
                            renderForm(res);
                        }
                    } else {
                        layer.msg(res.msg);
                    }
                },
                error: function () {
                    // layer.msg('加载失败', 2, 3);
                },
                complete: function () {

                }
            });
        } else {
            $.ajax({
                url: ajaxUrl,
                type: 'GET',
                dataType: 'html',
                success: function (res) {
                    $target.html(res);
                    if(renderForm && Object.prototype.toString.call(renderForm) == '[object Function]') {
                        renderForm(res);
                    }
                },
                error: function () {
                    // layer.msg('加载失败', 2, 3);
                },
                complete: function () {

                }
            });
        }
    }

    /**
     * _type, _url, _callback
     */
    function initPager(_config) {
        pageAjaxUrl = _config.url;
        type = _config.type;
        $target = _config.target;

        // 第n页
        $(document).on('click', '.ajaxpage', function(e) {
            e.preventDefault();
            var url = $(this).attr('data-url');
            renderPager(url, _config.renderForm);
        });

        // 每页n条
        $(document).on('change', '.ajaxpageselect', function(e) {
            e.preventDefault();
            var param = _config.callback();
            renderPager(param, _config.renderForm);
        });

        $(document).on('click', '.ajaxpagebutton', function(e) {
            var param = _config.callback();
            renderPager(param, _config.renderForm);
        });

        // 跳转页数
        $(document).on('keyup', '.inputpage', function(e) {
            var value = this.value,
                keyCode = e.keyCode;
            if(/^(37|38|39|40)$/.test(keyCode)) return;
            if(/\D/.test(value)){
                this.value = value.replace(/\D/, '');
            }
            if(keyCode === 13){
                var param = _config.callback();
                renderPager(param, _config.renderForm);
            }
        });
        $(document).on('blur', '.inputpage', function(e) {
            var param = _config.callback();
            renderPager(param, _config.renderForm);
        });
    }

    var pager = {
        renderPager: renderPager,
        initPager: initPager
    };

    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('Pager', pager);
});
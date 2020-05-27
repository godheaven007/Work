layui.define(function(exports){
    var $ = layui.jquery;

    function Pager(_config) {
        this.init(_config);
        this.eventHandle();
    }

    Pager.prototype = {
        constructor: Pager,
        defaults: {
            type: 1,                   // 1: 内容与分页条分离 2: 内容与分页条是整体
            url: '',                   // 请求url
            pageContainer: '',         // 分页内容
            pageBar: '',               // 分页条
            renderForm: function(){},  // 某些表格带checkbox，获取分页内容后需重新渲染
        },

        init: function(_config) {
            this.config = $.extend({}, this.defaults, _config);
        },

        eventHandle: function () {
            var _this = this;
            var $curPageBar = this.config.pageBar;
            // 第n页
            $curPageBar.find('.ajaxpage').on('click', function (e) {
                e.preventDefault();
                var $o = $(this),
                    url = $(this).attr('data-url');
                _this.render(url, $o);
            });

            // 每页n条
            $curPageBar.find('.ajaxpageselect').on('change', function (e) {
                var $o = $(this),
                    $ajaxpageselect = $('.ajaxpageselect'),
                    index = $ajaxpageselect.index($o);
                e.preventDefault();
                _this.render(_this.config.callback(index), $o);
            });

            $curPageBar.find('.ajaxpagebutton').on('click', function (e) {
                e.preventDefault();
                var $o = $(this),
                    $ajaxpagebutton = $('.ajaxpagebutton'),
                    index = $ajaxpagebutton.index($o);
                _this.render(_this.config.callback(index),$o);
            });

            // 跳转页数
            $curPageBar.find('.inputpage').on('keyup', function(e) {
                e.preventDefault();
                var $o = $(this),
                    value = this.value,
                    keyCode = e.keyCode;
                if(/^(37|38|39|40)$/.test(keyCode)) return;
                if(/\D/.test(value)){
                    this.value = value.replace(/\D/, '');
                }
                if(keyCode === 13){
                    var $inputpage = $('.inputpage'),
                        index = $inputpage.index($o);
                    _this.render(_this.config.callback(index), $o);
                }
            });
            $curPageBar.find('.inputpage').on('blur', function(e) {
                e.preventDefault();
                var $o = $(this),
                    $inputpage = $('.inputpage'),
                    index = $inputpage.index($o);
                _this.render(_this.config.callback(index), $o);
            });
        },

        getAjaxUrl: function(param) {
            var result = [];
            for(var key in param) {
                result.push(key + '=' + encodeURIComponent(param[key]));
            }
            if(this.config.url.indexOf('?') != -1) {
                return this.config.url + '&' + result.join('&');
            } else {
                return this.config.url + '?' + result.join('&');
            }
        },

        // 1: 内容与分页条分离
        render1: function(ajaxUrl) {
            var _this = this;
            $.ajax({
                url: ajaxUrl,
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    if(res.status) {
                        _this.config.pageContainer.html(res.data.listContent);
                        _this.config.pageBar.html(res.data.pageHtml);
                        _this.config.renderForm();
                        _this.eventHandle();
                    } else {
                        layer.msg(res.msg);
                    }
                    // layer.msg(res.msg);
                },
                error: function () {
                    // layer.msg('加载失败', 2, 3);
                },
                complete: function () {

                }
            });
        },

        // 2: 内容与分页条是整体
        render2: function(ajaxUrl, $target) {
            var _this = this;
            $.ajax({
                url: ajaxUrl,
                type: 'GET',
                dataType: 'html',
                success: function (res) {
                    var $tempObj = $(res);
                    _this.config.pageContainer.html($tempObj.find('.ajaxTableTbody').html());
                    _this.config.pageBar.html($tempObj.find('.ajaxTablePage').html());
                    _this.eventHandle();
                },
                error: function () {
                    // layer.msg('加载失败', 2, 3);
                },
                complete: function () {

                }
            });
        },

        render: function (param, $target) {
            var ajaxUrl = '';
            if(Object.prototype.toString.call(param) == '[object Object]') {
                ajaxUrl = this.getAjaxUrl(param)
            } else {
                ajaxUrl = param;
            }
            if(this.config.type == '1') {
                this.render1(ajaxUrl);
            } else {
                this.render2(ajaxUrl, $target);
            }
        }
    };

    function init(option) {
        return new Pager(option);
    }

    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('Pager2', init);
});
/**
 * 盖章归档-首页
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'laydate', 'Common', 'Pager'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;


    function renderSearchDate() {
        var $dateBox = $('.datebox');
        $dateBox.each(function (i, o) {
            laydate.render({
                elem: $(o)[0],
                trigger: 'click',
                // showBottom: false
                btns: ['clear', 'now']
            });
        });
    }

    // 获取分页参数
    function getSplitParam() {
        var param = {
            category: $('.category.layui-this').attr('data-value'),
            keyword: $('input[name=keyword]').val(),
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };
        param.signDtBegin = $('input[name=signDtBegin]').val();
        param.signDtEnd = $('input[name=signDtEnd]').val();
        param.archiveDtBegin = $('input[name=archiveDtBegin]').val();
        param.archiveDtEnd = $('input[name=archiveDtEnd]').val();

        return param;
    }

    function init() {
        var pageAjaxUrl = $('input[name=pageAjaxUrl]').val();

        // 签约日期\归档日期搜索
        if($('.datebox').length) {
            renderSearchDate();

            Pager.initPager({
                type: 2,
                url: pageAjaxUrl,
                callback: getSplitParam,
                target: $('.ajaxSearchResult')
            });
        }
    }

    // bug16606
    function updateTotalPage(url) {
        var param  = getSplitParam();
        var result = [];
        for(var key in param) {
            result.push(key + '=' + encodeURIComponent(param[key]));
        }
        if(url.indexOf('?') != -1) {
            url = url + '&' + result.join('&');
        } else {
            url = url + '?' + result.join('&');
        }

        Req.getReq(url, function (res) {
            if(res.status) {
                $('.totalContract').text(res.data.total);
            }
        })
    }

    $(function() {
        init();

        // 切换
        $(document).on('click', '.contract-search .category', function () {
            // $('.ajaxSearch').trigger('click');
        });

        // 搜索
        $(document).on('click', '.ajaxSearch', function () {
            var url = $(this).attr('data-url'),
                keyword = $('input[name=keyword]').val(),
                category = $('.category.layui-this').attr('data-value');
            var totalUrl = $(this).attr('data-total-url');

            if(!$('.datebox').length) {
                window.location.href = url + '?keyword=' + keyword + '&category=' + category;
            } else {
                var param  = getSplitParam();
                Pager.renderPager(param);

                updateTotalPage(totalUrl);
            }
        });
        $(document).on('keydown', 'input[name=keyword]', function(e) {
            if (e.keyCode == 13) {
                $('.ajaxSearch').trigger('click');
            }
        });
    });
});
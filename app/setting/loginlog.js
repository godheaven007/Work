/**
 * 设置-登录日志
 */

layui.use(['element', 'form', 'laydate', 'Dialog', 'Req', 'Pager', 'laydate', 'Common'], function() {
    var $ = layui.jquery,
        laydate = layui.laydate,
        form = layui.form,
        element = layui.element;
    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;

    function renderSearchDate() {
        laydate.render({
            elem: $('input[name=begindate]')[0],
            trigger: 'click',
            // showBottom: false,
            btns: ['clear', 'now'],
            done: function(value, date, endDate){
                var param  = getSplitParam();
                if(param) {
                    Pager.renderPager(param);
                }
            },
        });

        laydate.render({
            elem: $('input[name=enddate]')[0],
            trigger: 'click',
            // showBottom: false,
            btns: ['clear', 'now'],
            done: function(value, date, endDate){
                var param  = getSplitParam();
                if(param) {
                    Pager.renderPager(param);
                }
            },
        });
    }

    // 监听提交
    form.on('submit', function(data){
        return false;
    });

    form.on('select', function(data){
        var param  = getSplitParam();
        if(param) {
            Pager.renderPager(param);
        }
    });

    // 获取分页参数
    function getSplitParam() {
        var $beginDate = $('input[name=begindate]'),
            $endDate = $('input[name=enddate]');

        if($beginDate.val() && $endDate.val()) {
            if(!Common.Util.compareDate($beginDate.val(), $endDate.val())) {
                Dialog.errorDialog("开始日期不得大于结束日期");
                return false;
            }
        }

        var param = {
            startDay: $beginDate.val(),
            endDay: $endDate.val(),
            type: $('select[name=type] option:selected').val() || '',
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };

        if($('input[name=keyword]').length) {
            param.keyword = $('input[name=keyword]').val();
        }

        return param;
    }

    function init() {
        renderSearchDate();
        var pageAjaxUrl = $('#pageAjaxUrl').val();

        Pager.initPager({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam
        });
    }

    $(function() {
        init();

        // 搜索
        $(document).on('click', '.ajaxSearch', function(e) {
            var param  = getSplitParam();
            if(param) {
                Pager.renderPager(param);
            }
        });

        $(document).on('keydown', 'input[name=keyword]', function(e) {
            if (e.keyCode == 13) {
                $('.ajaxSearch').trigger('click');
            }
        });
    });
});
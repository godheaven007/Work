/**
 * 设置-日志
 */

layui.use(['element', 'form', 'laydate', 'Dialog', 'Req', 'Pager', 'laydate', 'Common'], function() {
    var $ = layui.jquery,
        laydate = layui.laydate,
        form = layui.form,
        element = layui.element;
    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;

    laydate.render({
        elem: '#datepicker',
        range: '~',
        done: function(value, date, endDate){
            var dateRange = value.split(' '),
                startDay = dateRange[0],
                endDay = dateRange[2];
            var param  = getSplitParam(startDay, endDay);
            Pager.renderPager(param);
        },
    });

    // 监听提交
    form.on('submit', function(data){
        return false;
    });

    form.on('select', function(data){
        var param  = getSplitParam();
        Pager.renderPager(param);
    });

    // 获取分页参数
    function getSplitParam(startDay, endDay) {
        var dateRange = $('#datepicker').val();

        var param = {
            startDay: startDay || (dateRange == '' ? '' : dateRange.split(' ')[0]),
            endDay: endDay || (dateRange == '' ? '' : dateRange.split(' ')[2]),
            type: $('select[name=type] option:selected').val() || '',
            keyword: $('input[name=keyword]').val(),
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };
        return param;
    }

    function init() {
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
            Pager.renderPager(param);
        });

        $(document).on('keydown', 'input[name=keyword]', function(e) {
            if (e.keyCode == 13) {
                $('.ajaxSearch').trigger('click');
            }
        });
    });
});
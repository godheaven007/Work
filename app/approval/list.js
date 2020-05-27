/**
 * 审批-列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;


    function init() {
        var pageAjaxUrl = $('#pageAjaxUrl').val();

        Pager.initPager({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam
        });
    }

    // 获取分页参数
    function getSplitParam() {
        var param = {
            type: $('select[name=ftype] option:selected').val(),
            keyword: $('input[name=keyword]').val(),
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };
        return param;
    }


    $(function() {

        init();

        /**
         * 搜索
         */
        $(document).on('click', '.ajaxSearch', function() {
            var param  = getSplitParam();
            Pager.renderPager(param);
        });
        $(document).on('keydown', 'input[name=keyword]', function(e) {
            if (e.keyCode == 13) {
                $('.ajaxSearch').trigger('click');
            }
        });
        form.on('select(ftype)', function (data) {
            var param  = getSplitParam();
            Pager.renderPager(param);
        });
    });
});
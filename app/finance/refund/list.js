/**
 * 财务-退租-列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager2'], function() {
    var $ = layui.jquery,
        form = layui.form,
        Pager2 = layui.Pager2,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;

    var pager = null;

    function init() {
        var pageAjaxUrl = $('#pageAjaxUrl').val();

        pager = Pager2({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam,
            pageContainer: $('.ajaxTableTbody'),
            pageBar: $('.ajaxTablePage')
        });
    }

    // 获取分页参数
    function getSplitParam() {
        var param = {
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
            pager.render(param);
        });
        $(document).on('keydown', 'input[name=keyword]', function(e) {
            if (e.keyCode == 13) {
                $('.ajaxSearch').trigger('click');
            }
        });
    });
});
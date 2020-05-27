/**
 * 查看关联电费（多分页）
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager2'], function() {
    var $ = layui.jquery,
        laydate = layui.laydate,
        form = layui.form,
        Pager2 = layui.Pager2,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;


    function getSplitParam(index) {
        var param = {
            limit: $('.ajaxpageselect').eq(index).find('option:selected').val() || 10,
            page: $('.inputpage').eq(index).val() || 1
        };

        return param;
    }

    function init() {
        var $ajaxTables = $('.ajaxTable');
        $ajaxTables.each(function (i, o) {
            var pageAjaxUrl = $('#pageAjaxUrl').val();
            Pager2({
                type: 2,
                url: pageAjaxUrl,
                callback: getSplitParam,
                pageContainer: $('.ajaxTableTbody').eq(i),
                pageBar: $('.ajaxTablePage').eq(i)
            });
        });
    }

    $(function() {
        init();

        // 没有图片的情况
        $(document).on('click', '.showReading', function () {
            var message = $(this).attr('data-message');
            Dialog.tipDialog({
                content: message,
                yesFn: function(index, layero) {
                    layer.close(index);
                }
            });
        });
    });
});
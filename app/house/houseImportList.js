/**
 * 房源导入-列表
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
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };

        return param;
    }

    $(function() {

        init();

        form.on('submit(saveSubmit)', function (data) {
            var elem = data.elem,
                $elem = $(elem),
                url = $elem.attr('data-url');
            var $form = $('form'),
                param = $form.serializeArray();

            Req.postReqCommon(url, param);

            return false;
        })
    });
});
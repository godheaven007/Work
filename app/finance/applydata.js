/**
 * 财务-发起对账
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager','upload', 'MUpload'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;

    function init() {
        MUpload({
            elem: $('.upload'),
            choose:function(){},
            maxNum: 1,
            exts: 'xls|xlsx'
        });
    }

    $(function() {
        init();
        form.on('submit(saveSubmit)', function (data) {
            var $elem = $(data.elem),
                url = $elem.attr('data-url');
            var param = $('form').serializeArray();
            Req.postReqCommon(url, param);
            return false;
        });
    });
});
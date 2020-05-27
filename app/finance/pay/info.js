/**
 * 财务-支出-详情
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'laydate', 'Common', 'Pager','upload', 'MUpload'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;

    function renderDatebox() {
        lay('.datebox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                btns: ['clear', 'now'],
                max: Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd')
            });
        });
    }

    function init() {
        MUpload({
            elem: $('.upload'),
            choose:function(){},
            size: 1024 * 5,
            maxNum: 5,
        });
        renderDatebox();
    }

    $(function() {
        init();

        form.on('submit(saveSubmit)', function (data) {
            var $elem = $(data.elem),
                url = $elem.attr('data-url');
            var param = $('form').serializeArray();

            Req.postReqCommon(url, param);
        })
    });
});
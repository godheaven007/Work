/**
 * 新建公告
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'laydate', 'upload', 'MUpload', 'Editor', 'CommonEditor'], function() {
    var $ = layui.jquery,
        form = layui.form,
        $form = $('form'),
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Dialog = layui.Dialog;
    var Req = layui.Req;
    var Editor = layui.Editor;
    var CommonEditor = layui.CommonEditor;
    var MUpload = layui.MUpload;

    var editor;

    function getParamStr(obj) {
        var result = [];
        for(var key in obj) {
            result.push(key + '=' + obj[key]);
        }
        return result.join('&');
    }

    function renderTimebox() {
        lay('.timebox').each(function(){
            laydate.render({
                elem: this,
                type: 'datetime',
                trigger: 'click'
            });
        });
    }

    function init() {
        renderTimebox();
        editor = CommonEditor.initEditor();
    }

    $(function() {
        init();

        // 发布
        form.on('submit(doSubmit)', function (data) {
            var elem = data.elem,
                url = $(elem).attr('data-url');
            var $form = $('form');
            var param = $form.serializeArray();

            // 验证编辑器内容
            var html = editor.$txt.html();
            html = html.replace(/<p><br><\/p>/g, '');
            if(html == '') {
                Dialog.errorDialog('正文不能为空');
                return false;
            }

            // 发布平台
            if(!$('input[name^=plam]:checked').length) {
                Dialog.errorDialog("至少选择一个发布平台");
                return false;
            }

            // 生效时间、失效时间
            var $startTime = $('input[name=start_time]'),
                $endTime = $('input[name=end_time]');
            var date1 = new Date($startTime.val()),
                date2 = new Date($endTime.val());

            if(date1.getTime() > date2.getTime()) {
                Dialog.errorDialog("失效时间需大于生效时间");
                return false;
            }

            // param.push({name:'content', value: editor.$txt.html()});
            param.push({name:'content', value: CommonEditor.filterInvalidBrTag()});

            Req.postReqCommon(url, param);

            return false;
        });
    });
});
/**
 * 服务-服务商
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common','upload', 'MUpload', 'Editor', 'CommonEditor'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        device = layui.device(),
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Editor = layui.Editor;
    var CommonEditor = layui.CommonEditor;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;

    var editor;

    $(function() {
        editor = CommonEditor.initEditor();
        var $uploads = $('.upload1');
        $uploads.each(function (i, o) {
            MUpload({
                iframeIndex: i,
                elem: $(o),
                exts: 'jpg|jpeg|png',
                maxNum: 1,
                size: 1024 * 1,
                replace: true,
                filePolicy: 'web'
            });
        });

        form.on('switch(switchTest)', function(data){
            if(this.checked) {
                $('input[name=isRecommend]').val(1);
                $('.coperation').removeClass('hidden');
            } else {
                $('input[name=isRecommend]').val(0);
                $('.coperation').addClass('hidden');
            }
        });

        form.on('submit(doSubmit)', function (data) {
            var elem = data.elem,
                url = $(elem).attr('data-url');
            var $form = $('form');
            var param = $form.serializeArray();

            if(!$('.coperation').hasClass('hidden')) {

                // 店铺Banner
                var $fileBanner = $('input[name^=fileIdbanner]');
                if(!$fileBanner.length || !$fileBanner.val()) {
                    Dialog.errorDialog("请上传店铺Banner图片");
                    return false;
                }

                // 验证编辑器内容
                var html = editor.$txt.html();
                html = html.replace(/<p><br><\/p>/g, '');
                if(html == '') {
                    Dialog.errorDialog('正文不能为空');
                    return false;
                }
            }

            // 品牌介绍
            // param.push({name:'editor', value: CommonEditor.editorDataHandle(editor.$txt.html())});
            // param.push({name:'editor', value: editor.$txt.html()});
            param.push({name:'editor', value: CommonEditor.filterInvalidBrTag()});

            Req.postReqCommon(url, param);

            return false;
        });
    });
});
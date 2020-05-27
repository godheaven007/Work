/**
 * 运维管理-系统停服
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'laydate'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Dialog = layui.Dialog;
    var Req = layui.Req;

    function renderDateBox() {
        lay('.dateBox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                btns: ['clear', 'now']
            });
        });
    }

    function renderTimeBox() {
        lay('.timeBox').each(function(){
            laydate.render({
                elem: this,
                type: 'time',
                trigger: 'click',
            });
        });
    }
    
    function getServiceDialogHtml(type) {
        var showUrl = 'http://oms.'+ Common.Util.getRootDomain() +'/assets/css/oms/images/pic-app.jpg';
        if(type == 2) {
            showUrl = 'http://oms.'+ Common.Util.getRootDomain() +'/assets/css/oms/images/pic-pc.jpg';
        }
        var _html = '<div class="layui-card-body" style="height: 180px;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item" style="padding-left: 20px;">' +
                                '<p class="c-gray-light">1. 暂停服务后，所有用户将无法使用PC端园区管理系统；</p>' +
                                '<p class="c-gray-light">2. 如需恢复服务，需在设置页面手动取消；</p>' +
                                '<p class="c-gray-light">3. PC端园区管理系统将展示暂停说明及预计恢复时间，查看<a href="'+ showUrl +'" class="c-link" target="_blank">展示效果</a></p>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-120">显示预计恢复时间</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="radio" name="status" lay-filter="status" value="1" title="显示" checked>'+
                                    '<input type="radio" name="status" lay-filter="status" value="0" title="未能确定恢复时间">' +
                                '</div>' +
                             '</div>' +
                            '<div class="layui-form-item recoveryDiv">' +
                                '<label class="layui-form-label text-w-120">选择预计恢复时间</label>' +
                                '<div class="layui-input-inline text-w-100">' +
                                    '<input type="text" name="date" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input text-w-100 dateBox">'+
                                '</div>' +
                                '<div class="layui-input-inline text-w-100">' +
                                    '<input type="text" name="time" placeholder="hh:MM:ss"  autocomplete="off" class="layui-input text-w-100 timeBox">'+
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 设置小程序审核版本
    function getMiniOpenDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item" style="padding-left: 20px;">' +
                                '<p class="c-gray-light">开启设置后需要填写小程序送交审核的版本号，并将版本信息返回给园企互动小程序；此设置在审核通过后请及时关闭。</p>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-120"><span class="c-orange">*</span>当前送审的版本号</label>' +
                                '<div class="layui-input-block" style="margin-left: 150px;">' +
                                    '<input type="text" name="versionCode" value="" lay-verify="required" lay-reqText="请填写版本号，如1.0.0" required placeholder="请填写版本号，如1.0.0" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }
    
    $(function() {

        // 暂停
        $(document).on('click', '.ajaxPcibs, .ajaxMinibs, .ajaxMinibs', function() {
            var $o = $(this),
                url = $o.attr('data-url');
            var type = 1;       // 1: 小程序   2: PC
            if($o.hasClass('ajaxPcibs')) {
                type = 2;
            }

            Dialog.formDialog({
                title: '系统暂停服务',
                content: getServiceDialogHtml(type),
                area: ['540px', 'auto'],
                success: function (layero, index) {
                    var $form = layero.find('form');
                    var $recoveryDiv = layero.find('.recoveryDiv'),
                        $dateBox = layero.find('.dateBox'),
                        $timeBox = layero.find('.timeBox');
                    form.render(null, 'formDialog');
                    renderDateBox();
                    renderTimeBox();

                    form.on('radio(status)', function (data) {
                        if(data.value == '1') {
                            // 显示
                            $recoveryDiv.removeClass('hidden');
                            $dateBox.attr('disabled', false);
                            $timeBox.attr('disabled', false);
                        } else {
                            // 未确定恢复
                            $recoveryDiv.addClass('hidden');
                            $dateBox.attr('disabled', true);
                            $timeBox.attr('disabled', true);
                        }
                    });

                    form.on('submit(bind)', function () {
                        var param = $form.serializeArray();

                        // 带看房源
                        if ($recoveryDiv.is(":visible")) {
                            if(!$dateBox.val() || !$timeBox.val()) {
                                Dialog.errorDialog("恢复时间不能为空");
                                return false;
                            }
                        }

                        Req.postReqCommon(url, param);

                        return false;
                    })
                }
            })
        });

        // 小程序送审版本设置
        $(document).on('click', '.ajaxMiniOpen', function () {
            var $o = $(this),
                url = $o.attr('data-url');

            Dialog.formDialog({
                title: '设置小程序审核版本',
                content: getMiniOpenDialogHtml(),
                btn: ['保存', '取消'],
                area: ['540px', 'auto'],
                success: function (layero, index) {
                    var $form = layero.find('form');
                    form.render(null, 'formDialog');

                    form.on('submit(bind)', function () {
                        var param = $form.serializeArray();


                        Req.postReqCommon(url, param);

                        return false;
                    })
                }
            })
        });

        // 恢复
        $(document).on('click', '.ajaxOpen, .ajaxMiniStop', function() {
            var url = $(this).attr('data-url');
            Req.getReqCommon(url);
        });

    });
});
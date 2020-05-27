/**
 * 设置-参数设置
 */

layui.use(['element', 'form', 'Dialog', 'Pager', 'Req','Common', 'DPTree2', 'Regex'], function() {
    var $ = layui.jquery,
        element = layui.element,
        form = layui.form;
    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var Req = layui.Req;
    var DPTree2 = layui.DPTree2;

    var parkRangeList = [];   // 分组小程序-园区范围

    form.on('submit', function(data) {
        return false;
    });

    function init() {
        var $deptparkListAjaxUrl = $('#deptparkListAjaxUrl');
        if($deptparkListAjaxUrl.length) {
            Req.getReq($deptparkListAjaxUrl.val(), function (res) {
                if(res.status) {
                    parkRangeList = res.data.data;
                }
            })
        }
    }

    // 小程序设置别名
    function getAliasDialogHtml(alias) {
        var _html = '<div class="layui-card-body">' +
            '<form class="layui-form" action="">' +
            '<div class="layui-form-item">' +
            '<div class="layui-input-blockxxx">' +
            '<input type="text" name="alias" value="'+ alias +'" lay-verify="required" maxlength="8" lay-reqText="请输入别名" required placeholder="请输入别名" autocomplete="off" class="layui-input" >'+
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
        init();

        // 上移\下移
        $(document).on('click', '.ajaxUpDown', function () {
            var $o = $(this),
                url = $o.attr('data-url');

            Req.getReqCommon(url);
        });

        // 开关
        $(document).on('click', '.ajaxSwitch', function () {
            var $o = $(this),
                message = $o.attr('data-message'),
                url = $o.attr('data-url');
            Dialog.confirmDialog({
                title: '提示',
                content: message,
                yesFn: function () {
                    Req.getReqCommon(url);
                }
            })
        });

        // 列外设置
        $(document).on('click', '.ajaxSettingOther', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                parkIds = $o.attr('data-park-id');

            DPTree2({
                title: '选择园区',
                searchPlaceHolder: '搜索园区名称',
                data: parkRangeList,
                zIndex: 99999999,
                isConfirmBtnShow: true,
                showOther: false,
                showFreeze: false,
                callback: function (instance) {
                    Req.postReqCommon(url, {parkIds: instance.parkIdArr.join(',')});

                    instance.removeEventListener();
                    instance.$tree.remove();
                },
                edit: parkIds.split(',')
            });
        });

        // 别名
        $(document).on('click', '.ajaxEditAlias', function () {
            var $o = $(this),
                alias = $o.attr('data-alias') ? $o.attr('data-alias') : '',
                url = $o.attr('data-url');


            Dialog.formDialog({
                title: '设置别名',
                content: getAliasDialogHtml(alias),
                success: function (layero, index) {
                    var $form = layero.find('form');

                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();
                        if(data.field.alias.length < 2) {
                            Dialog.errorDialog('别名2-8个字');
                            return false;
                        }
                        Req.postReqCommon(url, param);
                    })
                }
            })
        });
    });
});
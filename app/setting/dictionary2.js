/**
 * 设置-字典管理
 */

layui.use(['element', 'form', 'layer', 'Pager', 'Dialog', 'Req', 'Common'], function() {
    var $ = layui.jquery,
        form = layui.form,
        $form = $('form'),
        layer = layui.layer,
        element = layui.element;

    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var Req = layui.Req;

    function getOptsDialogHtml(param) {
        var _html = '<div class="layui-card-body">' +
            '<form class="layui-form" action="" lay-filter="formDialog">' +
                '<div class="layui-form-item">' +
                    '<label class="layui-form-label"><span class="c-orange">* </span>选项名称</label>' +
                    '<div class="layui-input-block">' +
                        '<input type="text" name="optionName" maxlength="15" value="'+ param.optionName +'" lay-verify="required" lay-reqText="请填写选项名称" required placeholder="请填写选项名称" autocomplete="off" class="layui-input" >'+
                    '</div>' +
                '</div>' +
                '<div class="layui-form-item">' +
                    '<label class="layui-form-label"><span class="c-orange">* </span>排序值</label>' +
                    '<div class="layui-input-block">' +
                        '<input type="text" name="optionSort" value="'+ param.optionSort +'" lay-verify="required|onlyZeroInteger" maxlength="4" lay-reqText="请填写排序值" required placeholder="输入数字，越小越靠前" autocomplete="off" class="layui-input" >' +
                        '<input type="hidden" name="optionUuId" value="'+ param.optionUuId +'">' +
                        '<input type="hidden" name="typeUuId" value="'+ param.typeUuId +'">' +
                    '</div>' +
                '</div>'+
                '<div class="layui-form-item">' +
                    '<label class="layui-form-label">备注</label>' +
                    '<div class="layui-input-block">' +
                        '<input type="text" name="remark" value="'+ param.remark +'" maxlength="50" autocomplete="off" class="layui-input" >' +
                    '</div>' +
                '</div>'+
                '<!--写一个隐藏的btn -->' +
                '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    // 添加、修改选项值
    function addEditOpts(param) {
        Dialog.formDialog({
            title: param.title,
            content: getOptsDialogHtml(param),
            area: ['500px', 'auto'],
            success: function (layero, index) {
                var $form = layero.find('form');

                form.on('submit(bind)', function(data) {
                    var $optionName = layero.find('input[name=optionName]'),
                        optionName = $optionName.val();
                    if(optionName.length < 2) {
                        Dialog.errorDialog("选项名称2~15个字");
                        return false;
                    }

                    var reqParam = $form.serializeArray();
                    Req.postReq(param.url, reqParam, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                var param  = getSplitParam();
                                Pager.renderPager(param);
                                layer.close(index);
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                    return false;
                })
            }
        })
    }

    function getSplitParam() {
        var param = {
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1,
            UuId: UuId
        };

        return param;
    }

    function init() {

        var pageAjaxUrl = $('#pageAjaxUrl').val();
        Pager.initPager({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam
        });
    }

    $(function() {

        init();

        // 添加选项值
        $(document).on('click', '.addThirdSubject', function(e) {
            e.preventDefault();
            var param = {
                url: $('.addThirdSubject').attr('data-url'),
                optionName: '',
                typeUuId: UuId,
                optionSort: '',
                optionUuId: '',
                remark: '',
                title: '添加选项值'
            };
            addEditOpts(param);
        });

        // 修改选项值
        $(document).on('click', '.update', function(e) {
            e.preventDefault();
            var $o = $(this),
                url = $o.attr('data-url'),
                optionName = $o.attr('data-codeKey'),
                optionSort = $o.attr('data-codesort'),
                optionUuId = $o.attr('data-optionuuid'),
                remark = $o.attr('data-coderemark');

            var param = {
                url: url,
                optionName: optionName,
                typeUuId: UuId,
                optionSort: optionSort,
                optionUuId: optionUuId,
                remark: remark,
                title: '修改选项值'
            };
            addEditOpts(param);
        });

        // 删除
        $(document).on('click', '.del', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                optionName = $o.attr('data-codeKey'),
                optionUuId = $o.attr('data-optionuuid');

            Dialog.delDialog({
                title: '删除选项',
                content: '<div style="padding: 20px;">确定要删除选项【'+ optionName +'】吗？</div>',
                yesFn: function(index, layero) {
                    Req.postReq(url, {optionUuId: optionUuId}, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                var param  = getSplitParam();
                                Pager.renderPager(param);
                                layer.close(index);
                            })
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                }
            });
        });

        form.on('submit', function(data) {
            return false;
        });
    });
});
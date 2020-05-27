/**
 * 运营-电表-列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager', 'laydate','upload', 'MUpload', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;
    var ListModule = layui.ListModule;


    function init() {

        if($('#selectAll').length) {
            ListModule.init(function() {
                $('#selectAll').prop('checked', false);
                form.render();
            });
        } else {
            ListModule.init();
        }
    }

    function calculateEletrictAmount(preReading, latestReading, maxReading, ratio) {
        var totalMount = 0;
        preReading = parseFloat(preReading);
        latestReading = parseFloat(latestReading);
        maxReading = parseFloat(maxReading);
        ratio = parseFloat(ratio);

        if(latestReading >= preReading) {
            var sub = Common.Util.accSub(preReading,latestReading);
            totalMount = Common.Util.accMul(sub, ratio);
        } else {
            var sub = Common.Util.accSub(preReading, maxReading);
            var sum = Common.Util.accAdd(sub, latestReading);

            totalMount =  Common.Util.accMul(sum, ratio);
        }
        return totalMount;
    }

    // 抄表读数调整
    function getPowerEditDialogHtml(d) {
        var _html = '<div class="layui-card-body" style="height: 350px; overflow-y: scroll;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">企业名称</label>' +
                                '<div class="layui-form-mid">'+ d.customerName +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">房源</label>' +
                                '<div class="layui-form-mid">'+ d.house +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">电表编号</label>' +
                                '<div class="layui-form-mid">'+ d.meterNum + d.meterTypeText +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">上次抄表读数</label>' +
                                '<div class="layui-form-mid">'+ d.preReading +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>本次抄表读数</label>' +
                                '<div class="layui-input-inline" style="width: 300px;">' +
                                    '<input type="text" name="latestReading" value="'+ d.latestReading +'" lay-verify="required|onlyDecmal14de4"  lay-reqText="请填写本次抄表读数" required placeholder="请填写本次抄表读数" autocomplete="off" class="layui-input">'+
                                '</div>' +
                            '</div>'+
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">备注</label>' +
                                '<div class="layui-input-inline" style="width: 300px;">' +
                                    '<textarea placeholder="请填写备注" maxlength="500" class="layui-textarea" name="remark" id="remark">'+ d.remark +'</textarea>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>电表照片</label>' +
                                '<div class="layui-input-inline" style="width: 340px;">' +
                                    '<div class="upload-wrapper" style="position: relative; padding-top: 90px;">' +
                                        '<div class="upload-box" style="margin-top: 5px;">' +
                                            '<button type="button" class="layui-btn upload" data-show-url="1" data-show-mode="1"><i class="layui-icon"></i>更换照片</button>' +
                                        '</div>' +
                                        '<div class="upload-list" style="position: absolute; top: 0;">' +
                                            '<div class="upload-file-item file-prev">' +
                                                '<a class="upload-file-name" href="'+ d.imgSrc +'" target="_blank">' +
                                                    '<img src="'+ d.imgSrc +'" class="file-img" width="78" height="78">' +
                                                '</a>' +
                                                '<i class="upload-file-remove"></i>' +
                                                '<input type="hidden" name="fileId[]" value="">' +
                                                '<input type="hidden" name="fileUrl[]" value="'+ d.imgSrc +'">' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function powerAdjust($target) {
        var param = {};
        param.url = $target.attr('data-url');
        param.customerName = $target.attr('data-customer-name');
        param.meterNum = $target.attr('data-meter-num');
        param.imgSrc = $target.attr('data-img-src');
        param.preReading = $target.attr('data-pre-reading');
        param.latestReading = $target.attr('data-latest-reading');
        param.meterType = $target.attr('data-meter-type');
        param.meterTypeText = param.meterType == 1 ? '(虚拟)' : '';
        param.remark = $target.attr('data-remark');
        param.maxReading = $target.attr('data-max-reading');
        param.ratio = $target.attr('data-ratio');
        param.house = $target.attr('data-house');

        Dialog.formDialog({
            title: '抄表读数调整',
            content: getPowerEditDialogHtml(param),
            area: ['540px', '480px'],
            btn: ['保存', '取消'],
            success: function (layero, index) {
                var $form = layero.find('form');
                var $elem = layero.find('.upload');
                MUpload({
                    // iframeIndex: Math.floor((Math.random() * 100)),
                    elem: $elem,
                    exts: 'jpg|jpeg|png',
                    size: 2 * 1024,
                    maxNum: 1,
                    replace: true
                });

                form.on('submit(bind)', function(data) {
                    // 电表照片
                    if(!layero.find('.upload-file-item').length) {
                        Dialog.errorDialog('请上传电表照片');
                        return false;
                    }
                    var newLatestReading = layero.find('input[name=latestReading]').val();

                    Dialog.confirmDialog({
                        title: '提醒',
                        content: '<p>本次抄表读数'+ newLatestReading +',上次抄表读数'+ param.preReading +',电表用量<b style="color: #f00;">'+ calculateEletrictAmount(param.preReading, newLatestReading, param.maxReading, param.ratio) +'</b>度。</p>',
                        yesFn: function (index, layero) {
                            var data = $form.serializeArray();
                            Req.postReqCommon(param.url, data);
                        }
                    });

                    return false;
                })
            },
            endFn: function () {
                $('iframe').remove();
            }
        })
    }

    $(function() {

        init();

        // 抄表读数调整
        $(document).on('click', '.powerEdit', function() {
            var $o = $(this),
                showUrl = $o.attr('data-show-url');

            if(!showUrl) {
                powerAdjust($o);
            } else {
                Req.getReq(showUrl, function (res) {
                    if(res.status) {
                        // 电表编辑（可修改）
                        powerAdjust($o);
                    } else {
                        // 电表编辑（不可修改）
                        Dialog.confirmDialog({
                            title: '提醒',
                            content: res.msg,
                            yesFn: function (index, layero) {
                                layer.close(index);
                            }
                        })
                    }
                });
            }
        });


        // 没有图片的情况
        $(document).on('click', '.showReading, .commonDialog', function () {
            var message = $(this).attr('data-message');
            Dialog.tipDialog({
                content: message,
                yesFn: function(index, layero) {
                    layer.close(index);
                }
            });
        });

        // 待确认电费（确认通过）
        $(document).on('click', '#powerConfirm', function () {
            var url = $(this).attr('data-url'),
                checkUrl = $(this).attr('data-check'),
                $selectedBoxes = $('.selectcheckbox:checked');
            var result = [];

            if(!$selectedBoxes.length) {
                Dialog.confirmDialog({
                    title: '提醒',
                    btn: ['我知道了'],
                    content: '请先勾选你需要确认的抄表数据再进行确认操作',
                    yesFn: function (index, layero) {
                        layer.close(index);
                    }
                });
                return false;
            }

            $selectedBoxes.each(function (i, o) {
                result.push($(o).val());
            });

            Req.getReq(checkUrl, function (res) {
                var msg = '<p>本次共确认<b class="c-orange">'+ result.length +'</b> 笔电费数据，请确保费用的准确，提交后将进入“回款”模块！</p>' +
                            '<p style="color:#f00;">注：此园区已开通在线缴费功能，生成的费用账单将通过小程序推送给客户。</p>';
                if(res.status) {
                    // 开通小程序在线支付
                } else {
                    // 未开通小程序在线支付
                    msg = '<p>本次共确认<b class="c-orange">'+ result.length +'</b> 笔电费数据，请确保费用的准确，提交后将进入“回款”模块！</p>' +
                        '<p style="color:#f00;">注：此园区未开通在线缴费功能，生成的费用账单将不会推送给客户。</p>';
                }
                Dialog.confirmDialog({
                    title: '电费确认提醒',
                    content: msg,
                    yesFn: function (index, layero) {
                        var param = {charge: result.join(',')};
                        Req.postReqCommon(url, param);
                    }
                })
            });
        });

        // 撤销
        $(document).on('click', '.ajax_remove', function () {
            var url = $(this).attr('data-url');
            Dialog.confirmDialog({
                title: '撤销提醒',
                content: '确定要撤销此条电费信息？撤销后的电费将会返回待确认列表。',
                yesFn: function (index, layero) {
                    Req.getReq(url, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                ListModule.updateList();
                                layer.close(index);
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    })
                }
            });
        });

        form.on('checkbox(layTableAllChoose)', function (data) {
            var $boxes = $('.selectcheckbox');

            var status = data.elem.checked;
            if(status) {
                $boxes.prop('checked', true);
            } else {
                $boxes.prop('checked', false);
            }
            form.render();
        });
        form.on('checkbox(layTableChoose)', function (data) {
            var allSize = $('.selectcheckbox').length,
                selectedSize = $('.selectcheckbox:checked').length;

            if(selectedSize == allSize) {
                $('#selectAll').prop('checked', true);
            } else {
                $('#selectAll').prop('checked', false);
            }
            form.render();
        });


        // 导出
        $(document).on('click', '.exportData', function () {
            var url = $(this).attr('data-url'),
                key = $(this).attr('data-key');

            var param = ListModule.getSplitParam();
            param.key = key;
            if($('select[name=status]').length) {
                param.statusKey = $('select[name=status] option:selected').text() || '';
            }

            Req.postReq(url, param, function (res) {
                if(res.status) {
                    Dialog.downloadDialog({
                        downloadUrl: res.data.url
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });
    });
});
/**
 * 设置-停车费列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager', 'upload', 'MUpload', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        Pager2 = layui.Pager2,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;
    var ListModule = layui.ListModule;

    function init() {
        ListModule.init();
    }

    function getModeItemHtml(item, result) {
        var _html = '', flag = false;
        for(var i = 0; i < result.length; i++) {
            if(item.codeValue == result[i].priceDuration) {
                _html ='<input type="checkbox" class="mode" name="mode[]" lay-filter="mode" lay-skin="primary" value="'+ item.codeValue +'" title="'+ item.codeKey +'" checked>';
                flag = true;
                break;
            }
        }
        if(!flag) {
            _html ='<input type="checkbox" class="mode" name="mode[]" lay-filter="mode" lay-skin="primary" value="'+ item.codeValue +'" title="'+ item.codeKey +'">';
        }
        return _html;
    }

    function getPriceItemHtml(item, result) {
        var _html = '', flag = false;
        for(var i = 0; i < result.length; i++) {
            if(item.codeValue == result[i].priceDuration) {
                _html = '<input class="priceItem layui-input text-w-100" type="text" value="'+ result[i].priceAmount +'" name="price[]" placeholder="请输入" lay-verify="price" lay-reqText="请填写租赁单价" autocomplete="off">';
                flag = true;
                break;
            }
        }
        if(!flag) {
            _html = '<input class="priceItem layui-input text-w-100" type="text" name="price[]" placeholder="请输入" lay-verify="price" lay-reqText="请填写租赁单价" disabled autocomplete="off">';
        }
        return _html;
    }

    function getModeHtml(result) {
        var _html = '';
        if(monthcodeList && monthcodeList.length) {
            monthcodeList.forEach(function (item, index) {
                _html += '<div class="modeItem" style="overflow:hidden; margin-bottom: 8px;">' +
                            '<div class="float-l" style="width: 120px;">' +
                                getModeItemHtml(item, result)+
                            '</div>'+
                            '<div class="layui-form-mid">' +
                                '<span>租赁单价</span>' +
                            '</div>' +
                            '<div class="layui-input-inline" style="width: 100px;">' +
                                getPriceItemHtml(item, result) +
                            '</div>' +
                            '<div class="layui-form-mid">' +
                                '<span>元</span>' +
                            '</div>' +

                    '</div>';
            });
        }
        return _html;
    }

    function getEditParkDialogHtml(parkName, parkStatus, result, attToResult, notice) {
        var _html = '<div class="layui-card-body" style="height: 350px; overflow-y: scroll;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">园区名称</label>' +
                                '<div class="layui-input-block">' +
                                    '<div class="layui-form-mid">'+ parkName +'</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">计费策略</label>' +
                                '<div class="layui-input-block">' +
                                    getModeHtml(result) +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">开通状态</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="radio" name="status" value="1" title="启用">' +
                                    '<input type="radio" name="status" value="0" title="禁用">' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">缴费须知</label>' +
                                '<div class="layui-input-block">' +
                                    '<textarea placeholder="弹窗展示给客户，可不填，最多500字" maxlength="500" style="resize: none;" class="layui-textarea" name="notice" id="notice">' +
                                        (!notice ? '' : notice)+
                                    '</textarea>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">停车管理制度</label>' +
                                '<div class="layui-input-block">' +
                                    '<div class="upload-wrapper">' +
                                        '<div class="upload-box">' +
                                         '<button type="button" class="layui-btn parkInstitution"><i class="layui-icon"></i>上传</button>' +
                                            '<div class="describe ml-10">可上传1个PDF文件，非必传</div>' +
                                            '</div>' +
                                            '<div class="upload-list">';
                        attToResult.forEach(function (item, index) {
                            _html += '<div class="upload-file-item">' +
                                        '<i class="file-icon '+ item.attFileType +'"></i>' +
                                        '<a class="upload-file-name" href="'+ item.attUrl +'" target="_blank">'+ item.attName +'</a>' +
                                        '<i class="upload-file-remove" data-id="'+ item.attFileId +'"></i>' +
                                        '<input type="hidden" name="fileId[]" value="'+ item.attFileId +'">' +
                                    '</div>';
                        });
                        _html += '</div>' +
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


    $(function() {

        init();

        $(document).on('click', '.ajaxEditPark', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                selectUrl = $o.attr('data-select-url'),
                parkName = $o.attr('data-park-name'),
                parkStatus = $o.attr('data-park-status'),
                editSubmitUrl = $o.attr('data-edit-submit-url');

            if(!!selectUrl) {
                Req.getReq(selectUrl, function (res) {
                    var priceTos = res.data.priceTos,
                        attTos = res.data.attTos,
                        result = [],
                        attToResult = [];
                    var notice = res.data.notice;
                    if(priceTos && priceTos.length) {
                        priceTos.forEach(function (item, index) {
                            var o = {};
                            o.priceDuration = item.priceDuration;
                            o.priceAmount = !item.priceAmount ? '' : item.priceAmount;
                            result.push(o);
                        })
                    }

                    if(attTos && attTos.length) {
                        attTos.forEach(function (item, index) {
                            var o = {};
                            o.attName = item.attName;
                            o.attFileId = item.attFileId;
                            o.attFileType = item.attFileType;
                            o.attUrl = item.attUrl;
                            attToResult.push(o);
                        })
                    }

                    Dialog.formDialog({
                        title: '编辑停车费标准',
                        content: getEditParkDialogHtml(parkName, parkStatus, result, attToResult, notice),
                        area: ['580px', 'auto'],
                        success: function (layero, index) {
                            var $form = layero.find('form');
                            form.val('formDialog', {
                                status: parkStatus
                            });
                            form.render(null, 'formDialog');

                            MUpload({
                                elem: layero.find('.parkInstitution'),
                                iframeIndex: 0,
                                exts: 'pdf',
                                maxNum: 1,
                                choose:function(){},
                            });

                            form.on('checkbox(mode)', function (data) {
                                var $elem = $(data.elem),
                                    $modeItem = $elem.parents('.modeItem');
                                if(data.elem.checked) {
                                    // 开启
                                    $modeItem.find('.priceItem').prop('disabled', false);
                                } else {
                                    // 关闭
                                    $modeItem.find('.priceItem').prop('disabled', true);
                                }
                                $modeItem.find('.priceItem').val('');
                            });

                            form.on('submit(bind)', function(data) {
                                var param = $form.serializeArray();
                                // Req.postReqCommon(url, param);
                                Req.postReq(url, param, function (res) {
                                    if(res.status) {
                                        Dialog.successDialog(res.msg, function () {
                                            ListModule.updateList();
                                            layer.close(index);
                                        });
                                        // Req.getReq(editSubmitUrl, function (info) {
                                        //     if(info.status) {
                                        //         $('.ajaxTableTbody').html(info.data.listContent);
                                        //         $('.ajaxTablePage').html(info.data.pageHtml);
                                        //         layer.close(index);
                                        //         init();
                                        //     }
                                        // })
                                    } else {
                                        Dialog.errorDialog(res.msg);
                                    }
                                })
                                return false;
                            })
                        }
                    });
                })
            }
        });

        form.verify({
            // 租赁单价
            price: function(value, item) {
                if(!$(item).prop("disabled")) {
                    var reg = /^([0-9](\.[0-9]{1,2}){0,1}|[1-9][0-9]{0,8}(\.[0-9]{1,2}){0,1})$/;
                    if(!reg.test(value)) {
                        return '仅支持最大9位整数允许2位小数';
                    }
                }
            }
        });
    });
});
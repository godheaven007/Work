/**
 * 运营-回款-列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'laydate', 'Common', 'Pager', 'ListModule', 'upload', 'MUpload', 'OTree', 'Flow'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        device = layui.device(),
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var MUpload = layui.MUpload;
    var Dialog = layui.Dialog;
    var ListModule = layui.ListModule;
    var Flow = layui.Flow;

    function init() {
        // bug16524
        // $('.layui-input').not('.layui-input.inputpage').val('');

        ListModule.init(function () {
            $('#selectAll').prop('checked', false);
            form.render();
        });
    }

    function renderDatebox(Date) {
        lay('.datebox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                // showBottom: false,
                btns: ['clear', 'now'],
                value: Date
            });
        });
    }

    // amount: 应收金额
    function getElectricDialogHtml(data, amount, cycle) {
        var d = data.data;
        var meterTypeText = d.meterType == '1' ? '(虚拟)' : '';
        var _html = '<div class="layui-card-body" style="height: 350px; overflow-y: scroll;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">企业名称</label>' +
                                '<div class="layui-form-mid">'+ d.preRecord.contractName +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">房源</label>' +
                                '<div class="layui-form-mid">'+ d.buildName + '-' + d.roomNum +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">电表编号</label>' +
                                '<div class="layui-form-mid">'+ d.meterNum + meterTypeText +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">上次抄表读数</label>' +
                                '<div class="layui-form-mid">' +
                                    '<a href="'+ d.preRecord.src +'" class="c-link" target="_blank" title="点击查看上次抄表读数图片">' +
                                        (d.preRecord.reading == null ? '' : d.preRecord.reading) +
                                    '</a>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">上次抄表日期</label>' +
                                '<div class="layui-form-mid">'+ (d.preRecord.recordDt == null ? '' : (Common.Util.dateFormat(new Date(d.preRecord.recordDt), 'yyyy-MM-dd')) ) +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">本次抄表读数</label>' +
                                '<div class="layui-form-mid">' +
                                    '<a href="'+ d.latestRecord.src +'" class="c-link" target="_blank" title="点击查看本次抄表读数图片">' +
                                        (d.latestRecord.reading == null ? '' : d.latestRecord.reading) +
                                    '</a>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">本次抄表日期</label>' +
                                '<div class="layui-form-mid">'+ (d.latestRecord.recordDt == null ? '' : (Common.Util.dateFormat(new Date(d.latestRecord.recordDt), 'yyyy-MM-dd')) ) +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">倍率/用量</label>' +
                                '<div class="layui-form-mid">'+ d.ratio + '/' + data.autal_power +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">电费单价</label>' +
                                '<div class="layui-form-mid">'+ (d.latestRecord.recordCharge == null ? '' : (d.latestRecord.recordCharge + '元/度')) +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">应收金额</label>' +
                                '<div class="layui-form-mid">'+ amount +'元</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">计费周期</label>' +
                                '<div class="layui-form-mid">'+ (cycle == null ? '' : cycle) +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">电费确认人</label>' +
                                '<div class="layui-form-mid">'+ (d.confirmBy == null ? '' : d.confirmBy) +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">确认时间</label>' +
                                '<div class="layui-form-mid">'+ (d.latestRecord.confirmDt == null ? '' : (Common.Util.dateFormat(new Date(d.latestRecord.confirmDt), 'yyyy-MM-dd')) ) +'</div>' +
                            '</div>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function getSubjectIdOpts() {
        var opts = '<option value="">请选择</option>';

        if(subjectList && subjectList.length) {
            for(var i = 0, len = subjectList.length; i < len; i++) {
                var curSubItem = subjectList[i];
                opts += '<optgroup label="'+ curSubItem.subName +'">';
                var threeSubList = curSubItem.threeSubjects;
                threeSubList.forEach(function (item, index) {
                    opts += '<option value="'+ item.subId +'">'+ item.subName +'</option>';
                });
                opts += '</optgroup>';
            }
        }

        return opts;
    }

    function getChargeImportDialogHtml(tempUrl) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"><span class="c-orange">* </span>费用科目</label>' +
                                '<div class="layui-input-inline">' +
                                    '<select name="subjectId" lay-filter="subjectId" lay-verify="required" lay-search>' +
                                        getSubjectIdOpts() +
                                    '</select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"><span class="c-orange">* </span>文件</label>' +
                                '<div class="layui-input-block">' +
                                    '<div class="upload-wrapper">' +
                                        '<div class="upload-box">' +
                                            '<button type="button" class="layui-btn upload" data-show-url="1"><i class="layui-icon"></i>上传</button>' +
                                        '</div>' +
                                        '<div class="upload-list"></div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item" style="margin-bottom: 0;">' +
                                '<label class="layui-form-label"></label>' +
                                '<div class="layui-input-block">' +
                                    '<a class="c-link mr-5" href="'+ tempUrl +'" target="_blank">模板下载</a>' +
                                '</div>'+
                            '</div>' +
                            <!--写一个隐藏的btn -->
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                        '</div>';
                    return _html;
    }

    function getCustomerOpts(customerId) {
        var opts = '<option value="">输入客户名称</option>';

        if(customerList && customerList.length) {
            for(var i = 0, len = customerList.length; i < len; i++) {
                var item = customerList[i];
                if(item.customerId == customerId) {
                    opts += '<option value="'+ item.customerId +'" data-sub="'+ item.contractRooms +'" selected>'+ item.customerName +'</option>';
                } else {
                    opts += '<option value="'+ item.customerId +'" data-sub="'+ item.contractRooms +'">'+ item.customerName +'</option>';
                }
            }
        }

        return opts;
    }

    function getSubejctOpts(subId) {
        var opts = '<option value="">输入费用科目</option>';

        if(subjectList && subjectList.length) {
            for(var i = 0, len = subjectList.length; i < len; i++) {
                var curSubItem = subjectList[i];
                opts += '<optgroup label="'+ curSubItem.subName +'">';
                var threeSubList = curSubItem.threeSubjects;
                threeSubList.forEach(function (item, index) {
                    if(item.subId == subId) {
                        opts += '<option value="'+ item.subId +'" selected>'+ item.subName +'</option>';
                    } else {
                        opts += '<option value="'+ item.subId +'">'+ item.subName +'</option>';
                    }
                });
                opts += '</optgroup>';
            }
        }

        return opts;
    }


    $(function() {
        init();

        // 电费-计费周期弹框
        $(document).on('click', '.electricDialog', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                amount = $o.attr('data-should-amount'),
                cycle = $o.attr('data-cycle');

            Req.getReq(url, function (res) {
                if(res.status) {
                    Dialog.confirmDialog({
                        title: '查看电费明细',
                        content: getElectricDialogHtml(res.data, amount, cycle),
                        yesFn: function (index, layero) {
                            layer.close(index);
                        }
                    })
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        // 应收金额调整
        $(document).on('click', '.ajaxAdjustCharge', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                flowUrl = $o.attr('data-flow-url'),
                canEditCustomer = $o.attr('data-can-edit-customer'),  // 0: 不可编辑  1：可编辑  （已收有钱不可编辑）
                customerName = $o.attr('data-customer-name'),
                contractNames = $o.attr('data-contract-names'),
                subId = $o.attr('data-sub-id'),
                subName = $o.attr('data-sub-name'),
                chargeAmount = $o.attr('data-charge-amount'),
                chargeStart = $o.attr('data-charge-start'),
                chargeEnd = $o.attr('data-charge-end'),
                chargeReceived = $o.attr('data-charge-received'),
                chargeDate = $o.attr('data-charge-date'),
                customerId = $o.attr('data-customer-id'),
                uuid = $o.attr('data-uuid');

            var _html = '<div class="layui-card-body" style="height: 350px; overflow-y: scroll;">' +
                            '<form class="layui-form" action="" lay-filter="formDialog">';

            if(canEditCustomer == '1') {
                // 可编辑
                _html += '<div class="layui-form-item">' +
                            '<label class="layui-form-label text-w-100">客户名称</label>' +
                            '<div class="layui-input-inline text-w-250">' +
                                '<select name="customerId" lay-filter="customerId" lay-verify="required" lay-search="" class="customerName">' +
                                    getCustomerOpts(customerId) +
                                '</select>' +
                            '</div>' +
                        '</div>' +
                        '<div class="layui-form-item">' +
                            '<label class="layui-form-label text-w-100">租赁房源</label>' +
                            '<div class="layui-form-mid rentHouse">'+ contractNames +'</div>' +
                            '<input type="hidden" name="customerName" value="'+ customerName +'">' +
                            '<input type="hidden" name="contractRooms" value="'+ contractNames +'">' +
                        '</div>'+
                        '<div class="layui-form-item">' +
                            '<label class="layui-form-label text-w-100">费用科目</label>' +
                            '<div class="layui-input-inline text-w-250">' +
                                '<select name="subject" lay-verify="required" lay-filter="" lay-search="">' +
                                    getSubejctOpts(subId) +
                                '</select>' +
                            '</div>' +
                        '</div>';
            } else {
                // 不可编辑
                _html += '<div class="layui-form-item">' +
                            '<label class="layui-form-label text-w-100">客户名称</label>' +
                            '<div class="layui-input-inline text-w-250">' +
                                '<input type="hidden" name="customerId" value="'+ customerId +'">' +
                                '<input type="hidden" name="customerName" value="'+ customerName +'">' +
                            '</div>' +
                        '</div>' +
                        '<div class="layui-form-item">' +
                            '<label class="layui-form-label text-w-100">租赁房源</label>' +
                            '<div class="layui-form-mid rentHouse">'+ contractNames +'</div>' +
                            '<input type="hidden" name="contractRooms" value="'+ contractNames +'">' +
                        '</div>'+
                        '<div class="layui-form-item">' +
                            '<label class="layui-form-label text-w-100">费用科目</label>' +
                            '<div class="layui-form-mid">'+ subName +'</div>' +
                            '<input type="hidden" name="subject" value="'+ subId +'">' +
                        '</div>' +
                    '</div>';
            }
            _html +=

                                '<div class="layui-form-item">' +
                                    '<label class="layui-form-label text-w-100">计费周期</label>' +
                                    '<div class="layui-input-block">' +
                                        '<div class="layui-input-inline text-w-120">' +
                                            '<input type="text" name="begindate" value="'+ chargeStart +'" lay-verify="date|required" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox">' +
                                        '</div>' +
                                        '<div class="layui-form-mid"> ~ </div>' +
                                        '<div class="layui-input-inline text-w-120">' +
                                            '<input type="text" name="enddate" value="'+ chargeEnd +'" lay-verify="date|required" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox">' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="layui-form-item">' +
                                    '<label class="layui-form-label text-w-100">已收金额</label>' +
                                    '<div class="layui-form-mid">'+ chargeReceived +'元</div>' +
                                    '<input type="hidden" name="chargeReceived" value="'+ chargeReceived +'">' +
                                '</div>' +
                                '<div class="layui-form-item">' +
                                    '<label class="layui-form-label text-w-100">应收日期</label>' +
                                    '<div class="layui-input-block">' +
                                        '<div class="layui-input-inline text-w-250">' +
                                            '<input type="text" name="shoulddate" value="'+ chargeDate +'" lay-verify="date|required" placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox">' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="layui-form-item"  style="margin-bottom: 0;">' +
                                    '<label class="layui-form-label text-w-100">应收金额</label>' +
                                    '<div class="layui-input-inline text-w-250">' +
                                        '<input type="text" name="shouldprice" value="'+ chargeAmount +'" lay-verify="required|onlyDecmal9" autocomplete="off" class="layui-input">'+
                                    '</div>' +
                                    '<div class="layui-form-mid">元</div>' +
                                '</div>' +
                                '<div class="layui-form-item">' +
                                    '<label class="layui-form-label text-w-100"></label>' +
                                    '<div class="layui-input-inline text-w-250">' +
                                        '<p style="color:#ccc;">如无需收取此费用，请填写 0 即可</p>'+
                                    '</div>' +
                                '</div>' +
                                '<div class="layui-form-item">' +
                                    '<label class="layui-form-label text-w-100">费用调整说明</label>' +
                                    '<div class="layui-input-inline text-w-250">' +
                                        '<textarea placeholder="费用说明" maxlength="500" lay-verify="required" class="layui-textarea" name="desc" id="desc"></textarea>' +
                                    '</div>' +
                                '</div>' +
                                '<input type="hidden" name="uuid" value="'+ uuid +'">' +
                                '<!--写一个隐藏的btn -->' +
                                '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                                '</button>' +
                            '</form>' +
                        '</div>';
            Dialog.formDialog({
                title: '应收调整',
                content: _html,
                area: ['550px', 'auto'],
                success: function (layero, index) {
                    renderDatebox();
                    form.render(null, 'formDialog');

                    var $form = layero.find('form');
                    var $rentHouse = layero.find('.rentHouse'),
                        $customerName = layero.find('input[name=customerName]'),
                        $contractRooms = layero.find('input[name=contractRooms]');
                    var $beginDate = layero.find('input[name=begindate]'),
                        $endDate = layero.find('input[name=enddate]');

                    var $shouldprice = layero.find('input[name=shouldprice]');


                    form.on('select(customerId)', function (data) {
                        var $elem = $(data.elem),
                            customerId = data.value;
                        var curRoomName = $elem.find('option:selected').attr('data-sub'),
                            curCustomerName = $elem.find('option:selected').text();

                        if(curRoomName) {
                            $rentHouse.html(curRoomName);
                            $customerName.val(curCustomerName);
                            $contractRooms.val(curRoomName);
                        } else {
                            $rentHouse.html('');
                            $customerName.val('');
                            $contractRooms.val('');
                        }
                    });

                    form.on('submit(bind)', function (data) {
                        if($beginDate.val() && $endDate.val()) {
                            if(!Common.Util.compareDate($beginDate.val(), $endDate.val())) {
                                Dialog.errorDialog("开始时间不能晚于结束时间");
                                return false;
                            }
                        }

                        // 应收金额大于等于已收金额
                        if(Common.Util.accSub(chargeReceived, parseFloat($shouldprice.val())) < 0) {
                            Dialog.errorDialog("应收金额应大于等于已收金额");
                            return false;
                        }

                        var param = $form.serializeArray();
                        Flow.handleFlowByForm(flowUrl, url, param, function () {
                            layer.close(index);
                        });
                        return false;
                    });
                }
            })
        });

        // 全选
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

        // 单选
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

        // 登记应收账-批量导入
        $(document).on('click', '.chargeBatchImport', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                tempUrl = $o.attr('data-template-url');

            Dialog.formDialog({
                title: '应收导入',
                content: getChargeImportDialogHtml(tempUrl),
                area: ['450px', '280px'],
                success: function (layero, index) {
                    form.render(null, 'formDialog');
                    var $form = layero.find('form');
                    var $elem = layero.find('.upload');
                    MUpload({
                        elem: $elem,
                        exts: 'xls|xlsx',
                        maxNum: 1
                    });
                    form.on('submit(bind)', function(data) {
                        var param = $form.serializeArray();

                        if(!layero.find('.upload-file-item').length) {
                            Dialog.errorDialog("请选择上传文件");
                            return false;
                        }
                        Req.postReq(url, param, function (res) {
                            if(res.status) {
                                if (res.data.url) {
                                    window.location.href = res.data.url;
                                } else {
                                    window.location.reload();
                                }
                            } else {
                                Dialog.errorDialog(res.msg);
                            }

                        });
                        return false;
                    })
                },
                endFn: function () {
                    // IE浏览器上传
                    if (device.ie && device.ie < 10) {
                        $('iframe').remove();
                    }
                }
            })
        });

    });
});
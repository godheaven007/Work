/**
 * 运营-回款-已收费用-详情
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'laydate', 'Common', 'OTree', 'Print', 'Approval', 'Flow'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var Approval = layui.Approval;
    var Flow = layui.Flow;

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
    $(function() {

        Approval();

        // 撤回
        $(document).on('click', '#cancelReg', function() {
            var url = $(this).attr('data-url');

            Dialog.confirmDialog({
                title: '提醒',
                content: '取消登记后，此应收账登记申请将被自动删除，确定要取消吗？',
                yesFn: function(index, layero) {
                    Req.getReq(url, function(res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg);
                            if(res.data.url) {
                                window.location.href = res.data.url;
                            }
                            layer.close(index);
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    })
                }
            })
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
                uuid = $o.attr('data-uuid'),
                instanceId = $o.attr('data-instance-id'),
                desc = $o.attr('data-desc');

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
                '<textarea placeholder="费用说明" maxlength="500" lay-verify="required" class="layui-textarea" name="desc" id="desc">'+ desc +'</textarea>' +
                '</div>' +
                '</div>' +
                '<input type="hidden" name="uuid" value="'+ uuid +'">' +
                '<input type="hidden" name="instanceId" value="'+ instanceId +'">' +
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

        form.on('submit', function(data){
            return false;
        });
    });
});
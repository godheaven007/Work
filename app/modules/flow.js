/**
 * 流程审批(自由、固定流程)
 */
layui.define(function (exports) {
    var $ = layui.jquery;
    var layer = layui.layer;
    var form = layui.form;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var OTree = layui.OTree;
    var treeList = [];

    var getRootDomain = function() {
        var host = "null",
            url,
            origin;
        if (typeof url == "undefined" || null == url)
            url = window.location.href;
        origin = url.split('?')[0];
        var regex = /.*\:\/\/([^\/|:]*).*/;
        var matchVal = origin.match(regex);
        if (typeof matchVal != "undefined" && null != matchVal) {
            host = matchVal[1];
        }
        if (typeof host != "undefined" && null != host) {
            var strAry = host.split(".");
            if (strAry.length > 1) {
                host = strAry[strAry.length - 2] + "." + strAry[strAry.length - 1];
            }
        }
        return host;
    };

    function getDeptList() {
        var url = $('#deptListAjaxUrl').val();
        Req.getReq(url, function (res) {
            if(res.status) {
                treeList = res.data.data;
            }
        })
    }

    // 自由流程
    function getFreeDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label" style="width: 90px;"><span class="c-orange">* </span>流程审批人</label>' +
                                '<div class="layui-input-block" style="margin-left: 120px;">' +
                                    '<input type="text" name="approverName" value="" placeholder="点击选择审批人" lay-verify="required" autocomplete="off" class="layui-input" readonly>'+
                                    '<input type="hidden" name="approverId" value="">' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label" style="width: 90px;">抄送人(可选)</label>' +
                                '<div class="layui-input-block" style="margin-left: 120px;">' +
                                    '<input type="text" name="ccPersonName" value="" placeholder="点击选择抄送人" autocomplete="off" class="layui-input" readonly>'+
                                    '<input type="hidden" name="ccPersonId" value="">' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 固定流程
    function getFixedDialogHtml(flowData) {
        var tempFlowData = $.extend(true, {}, flowData);
        var conditionId = tempFlowData.conditionId,
            conditionNodeTos = tempFlowData.conditionNodeTos,
            nodeTos = tempFlowData.nodeTos;
        var list;

        if(conditionId) {
            list = conditionNodeTos;
        } else {
            list = nodeTos;
        }

        var _html = '<div class="layui-card-body">' +
            '<form class="layui-form" action="">' +
                '<div class="layui-card-body" style="min-height: 240px; max-height: 450px; overflow-y: scroll;">' +
                    '<h5>审批流程：</h5>' +
                    '<dl class="approval-process">';

            for(var i = 0, len = list.length; i < len; i++) {
                var curNode = list[i],
                    curWorkerTos = curNode.workerTos;

                _html += '<dd>' +
                    '<div class="arrow-dashed-s"></div>';
                if(curWorkerTos.length) {
                    var firstWorker = curWorkerTos[0];
                    if(firstWorker.workerType == 'approver') {
                        var message = '审批人：' + firstWorker.empName;
                        curWorkerTos.splice(0, 1);
                        if(curWorkerTos.length) {
                            message += '<br>协同审批人：';
                            var result = [];
                            curWorkerTos.forEach(function (item, ind) {
                                result.push(item.empName);
                            });
                            message += result.join('、');
                        }
                        _html += '<img src="'+ firstWorker.empAvatar +'" class="hoverTips" data-message="'+ message +'">' +
                            '<span class="txt">'+ firstWorker.empName +'</span>';
                    } else {
                        var message = '审批人：--';
                        if(curWorkerTos.length) {
                            message += '<br>协同审批人：';
                            var result = [];
                            curWorkerTos.forEach(function (item, ind) {
                                result.push(item.empName);
                            });
                            message += result.join('、');
                        }
                        _html += '<img class="no-user hoverTips" data-message="'+ message +'" src="http://ibs.'+ getRootDomain() +'/assets/css/images/ico-no-user.png">';
                    }

                    if(curWorkerTos.length) {
                        _html += '<div class="bubble">'+ curWorkerTos.length +'人协同</div>';
                    }
                    _html += '</dd>';
                }
            }
            _html += '</dl>' +
                    '<div class="layui-form mt-15">' +
                        '<span class="vm">抄送人：</span>' +
                        '<div class="layui-inline text-w-350 ml-5 vm">' +
                            '<input type="text" name="ccPersonName" value="" placeholder="点击选择抄送人" autocomplete="off" class="layui-input" readonly>'+
                            '<input type="hidden" name="ccPersonId" value="">' +
                        '</div>' +
                    '</div>' +
                '</div>'+
                '<!--写一个隐藏的btn -->' +
                '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                '</button>' +
                '</form>' +
            '</div>';
        return _html;
    }

    function doFreeFlow(param, flowData, url) {
        Dialog.formDialog({
            id: 88888888,
            title: '提交审批',
            content: getFreeDialogHtml(),
            success: function(layero, index) {
                var $approverName = layero.find('input[name=approverName]'),
                    $approverId = layero.find('input[name=approverId]'),
                    $ccPersonName = layero.find('input[name=ccPersonName]'),
                    $ccPersonId = layero.find('input[name=ccPersonId]');

                // 审批人
                $approverName.click(function() {
                    var treeParam = {
                        title: '选择人员',
                        isConfirmBtnShow: true,
                        type: false,
                        data: treeList,
                        callback: function(instance) {
                            $approverName.val(instance.eidTextArr.join(','));
                            $approverId.val(instance.eidArr.join(','));
                            instance.removeEventListener();
                            instance.$tree.remove();
                        },
                        zIndex:99999999
                    };
                    if(!$approverName.val()) {
                        // 未添加过
                        OTree(treeParam);
                    } else {
                        treeParam.edit = [$approverId.val()];
                        OTree(treeParam);
                    }
                });

                // 抄送人
                $ccPersonName.click(function() {
                    var treeParam = {
                        title: '选择人员',
                        isConfirmBtnShow: true,
                        data: treeList,
                        callback: function(instance) {
                            $ccPersonName.val(instance.eidTextArr.join('、'));
                            $ccPersonId.val(instance.eidArr.join(','));
                            instance.removeEventListener();
                            instance.$tree.remove();
                        },
                        zIndex:99999999
                    };
                    if(!$ccPersonName.val()) {
                        // 未添加过
                        OTree(treeParam);
                    } else {
                        treeParam.edit = $ccPersonId.val().split(',');
                        OTree(treeParam);
                    }
                });

                form.on('submit(bind)', function(data){
                    if(Object.prototype.toString.call(param) == '[object Array]') {
                        // 表单提交(数组类型)
                        param.push({name: 'instanceType', value: flowData.instanceType});
                        param.push({name: 'conditionId', value: flowData.conditionId});
                        param.push({name: 'approverName', value: $approverName.val()});
                        param.push({name: 'approverId', value: $approverId.val()});
                        param.push({name: 'ccPersonName', value: $ccPersonName.val()});
                        param.push({name: 'ccPersonId', value: $ccPersonId.val()});
                        Req.postReqCommon(url, param);
                    } else {
                        // 登记应收账（对象类型）
                        param.instanceType = flowData.instanceType;
                        param.conditionId = flowData.conditionId;
                        param.approverName = $approverName.val();
                        param.approverId = $approverId.val();
                        param.ccPersonName = $ccPersonName.val();
                        param.ccPersonId = $ccPersonId.val();
                        Req.postReqCommon(url, {data: JSON.stringify(param)});
                    }
                    // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                    return false;
                });
            }
        });
    }

    function doFixedFlow(param, flowData, url) {
        Dialog.formDialog({
            id: 88888888,
            title: '提交审批',
            content: getFixedDialogHtml(flowData),
            area: ['750px', 'auto'],
            success: function (layero, index) {
                var $ccPersonName = layero.find('input[name=ccPersonName]'),
                    $ccPersonId = layero.find('input[name=ccPersonId]');

                // 抄送人
                $ccPersonName.click(function() {
                    var treeParam = {
                        title: '选择人员',
                        isConfirmBtnShow: true,
                        data: treeList,
                        callback: function(instance) {
                            $ccPersonName.val(instance.eidTextArr.join('、'));
                            $ccPersonId.val(instance.eidArr.join(','));
                            instance.removeEventListener();
                            instance.$tree.remove();
                        },
                        zIndex:99999999
                    };
                    if(!$ccPersonName.val()) {
                        // 未添加过
                        OTree(treeParam);
                    } else {
                        treeParam.edit = $ccPersonId.val().split(',');
                        OTree(treeParam);
                    }
                });

                form.on('submit(bind)', function(data){

                    var nodeTos;
                    if(flowData.conditionId) {
                        nodeTos = flowData.conditionNodeTos;
                    } else {
                        nodeTos = flowData.nodeTos;
                    }

                    if(Object.prototype.toString.call(param) == '[object Array]') {
                        // 表单提交(数组类型)
                        param.push({name: 'instanceType', value: flowData.instanceType});
                        param.push({name: 'conditionId', value: flowData.conditionId});
                        param.push({name: 'ccPersonName', value: $ccPersonName.val()});
                        param.push({name: 'ccPersonId', value: $ccPersonId.val()});
                        param.push({name: 'nodeTos', value: JSON.stringify(nodeTos)});
                        Req.postReqCommon(url, param);
                    } else {
                        // 登记应收账（对象类型）
                        param.instanceType = flowData.instanceType;
                        param.conditionId = flowData.conditionId;
                        param.ccPersonName = $ccPersonName.val();
                        param.ccPersonId = $ccPersonId.val();
                        param.nodeTos = nodeTos;
                        Req.postReqCommon(url, {data: JSON.stringify(param)});
                    }

                    // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                    return false;
                });
            }
        })
    }

    // 登记应收账（对象类型）
    function handleFlowByJSON(flowUrl, submitUrl, param, cb) {

        Req.postReq(flowUrl, {data: JSON.stringify(param)}, function (res) {
            if(res.status) {
                var flowData = res.data.flowData;
                if(flowData.instanceType == 'free') {
                    // 自由流程
                    doFreeFlow(param, flowData, submitUrl);
                } else {
                    // 固定流程
                    doFixedFlow(param, flowData, submitUrl);
                }
            } else {
                Dialog.errorDialog(res.msg);
            }
            cb && cb();
        });
    }

    // 表单提交类型
    function handleFlowByForm(flowUrl, submitUrl, param, cb) {

        Req.postReq(flowUrl, param, function (res) {
            if(res.status) {
                var flowData = res.data.flowData;
                if(flowData.instanceType == 'free') {
                    // 自由流程
                    doFreeFlow(param, flowData, submitUrl);
                } else if(flowData.instanceType == 'fixed') {
                    // 固定流程
                    doFixedFlow(param, flowData, submitUrl);
                }
            } else {
                Dialog.errorDialog(res.msg);
            }
            cb && cb();
        });
    }

    getDeptList();

    var Flow = {
        handleFlowByJSON: handleFlowByJSON,
        handleFlowByForm: handleFlowByForm,
        doFreeFlow: doFreeFlow,
        doFixedFlow: doFixedFlow
    }

    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('Flow', Flow);
});